// ---------------------------------------------------------------------------
// UNDUM game library. This file needs to be supplemented with a game
// file (conventionally called "your-game-name.game.js" which will
// define the content of the game.
// ---------------------------------------------------------------------------

(function() {
    // -----------------------------------------------------------------------
    // Infrastructure Implementations
    // -----------------------------------------------------------------------

    /* Crockford's inherit function */
    Function.prototype.inherits = function (parent) {
        var d = {}, p = (this.prototype = new parent());
        this.prototype.uber = function (name) {
            if (!(name in d)) d[name] = 0;
            var f, r, t = d[name], v = parent.prototype;
            if (t) {
                while (t) {
                    v = v.constructor.prototype;
                    t -= 1;
                }
                f = v[name];
            } else {
                f = p[name];
                if (f == this[name]) {
                    f = v[name];
                }
            }
            d[name] += 1;
            r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
            d[name] -= 1;
            return r;
        };
        return this;
    };

    var hasLocalStorage = function() {
        return ('localStorage' in window) && window['localStorage'] !== null;
    }

    // -----------------------------------------------------------------------
    // Types for user instantiation.
    // -----------------------------------------------------------------------

    /* The game is split into situations. */
    var Situation = function(opts) {
        if (opts) {
            if (opts.enter) this._enter = opts.enter;
            if (opts.act) this._act = opts.act;
            if (opts.exit) this._exit = opts.exit;
        }
    };
    /* A function that takes action when we enter a situation. The
     * last parameter indicates the situation we have just left: it
     * may be null if this is the starting situation. Unlike the
     * exit() method, this method cannot prevent the transition
     * happening: its return value is ignored. */
    Situation.prototype.enter = function(character, system, from) {
        if (this._enter) this._enter(character, system, from);
    };
    /* A function that takes action when we carry out some action in a
     * situation that isn't intended to lead to a new situation. */
    Situation.prototype.act = function(character, system, action) {
        if (this._act) this._act(character, system, action);
    };
    /* A function that takes action when we exit a situation. The last
     * parameter indicates the situation we are going to. This method
     * should return true if the exit is allowed, and false to keep
     * the character in this situation. If the character isn't allowed
     * to leave, then there should be some explanation. */
    Situation.prototype.exit = function(character, system, to) {
        if (this._exit) return this._exit(character, system, to);
        else return true;
    };

    /* A simple situation just displays its text when the situation is
     * entered. The heading is optional. */
    var SimpleSituation = function(content, opts) {
        Situation.call(this, opts);
        this.content = content;
        this.heading = opts && opts.heading;
    }
    SimpleSituation.inherits(Situation);
    SimpleSituation.prototype.enter = function(character, system, from) {
        if (this.heading) system.writeHeading(this.heading);
        system.write(this.content);
        if (this._enter) this._enter(character, system, from);
    };

    /* An action situation is just like a simple situation, only it
     * has a number of fixed responses to internal actions. The
     * actions parameter should be an object mapping the action id to
     * the text response. Responses can be either a
     * function(character, system, action) that returns a string of
     * content, or just the raw string of content. */
    var ActionSituation = function(content, actions, opts) {
        SimpleSituation.call(this, content, opts);
        this.actions = actions;
    };
    ActionSituation.inherits(SimpleSituation);
    ActionSituation.prototype.act = function(character, system, action) {
        response = this.actions[action];
        try {
            response = response(character, system, action);
        } catch (err) {
        }
        system.write(response);
        if (this._act) this._act(character, system, action);
    };


    /* Instances of this class define the qualities that characters
     * may possess. The title should be a string, and can contain
     * HTML. The priority, if given, is a string used to sort
     * qualities within their groups. If you don't give a priority,
     * then the title will be used. Normally you either don't give a
     * priority, or else use a priority string containing 0-padded
     * numbers (e.g. "00001"), because numbers sort before
     * letters. The group parameter allows you to specify that
     * this definition sits within a particular group. All qualities
     * without a group are placed at the end of the list. */
    var QualityDefinition = function(title, opts) {
        var myOpts = $.extend({
            priority: title,
            group: null,
            extraClasses: null
        }, opts);
        this.title = title;
        this.priority = myOpts.priority;
        this.group = myOpts.group;
        this.extraClasses = myOpts.extraClasses;
    };
    /* Formats the value (which is always numeric) into the value to
     * be displayed. The result should be HTML (but no tags are
     * needed). If null is returned, then the quality definition will
     * not be displayed, so if you want an empty value return an empty
     * string. */
    QualityDefinition.prototype.format = function(character, value) {
        return value.toString();
    };

    /* A Quality that is always displayed as the floor of the current
     * value. */
    var IntegerQuality = function(title, opts) {
        QualityDefinition.call(this, title, opts);
    };
    IntegerQuality.inherits(QualityDefinition);
    IntegerQuality.prototype.format = function(character, value) {
        return parseInt(value).toString();
    };

    /* A quality that displays its full numeric value, including
     * decimal component. This is actually a trivial wrapper around
     * the QualityDefinition class, which formats in the same way. */
    var NumericQuality = function(title, opts) {
        QualityDefinition.call(this, title, opts);
    };
    NumericQuality.inherits(QualityDefinition);

    /* A quality that displays its values as one of a set of
     * words. These map to the integer component of the corresponding
     * quality value. With offset=0 (the default), then a value of 0
     * will map to the first word, and so on. If offset is non-zero
     * then the value given will correspond to the first word in the
     * list. So if offset=4, then the first word in the list will be
     * used for value=4. Words outside the range of the values given
     * will be constructed from the limits of the values given and an
     * integer modifier. So if the words are 'low', 'high' with no
     * offset, a value of 2 will be 'high+1' and -2 will be
     * 'low-2'. */
    var WordScaleQuality = function(title, values, opts) {
        var myOpts = $.extend({
            offset: null
        }, opts);
        QualityDefinition.call(this, title, opts);
        this.values = values;
        this.offset = myOpts.offset;
    };
    WordScaleQuality.inherits(QualityDefinition);
    WordScaleQuality.prototype.format = function(character, value) {
        var val = parseInt(value - this.offset);
        var mod = "";
        if (val < 0) {
            mod = val.toString();
            val = 0;
        } else if (val >= this.values.length) {
            mod = "+"+(val-this.values.length+1).toString();
            val = this.values.length-1;
        }
        return this.values[val]+mod;
    };

    /* An on/off quality that removes itself from the quality list if
     * it is not present. */
    var OnOffQuality = function(title, opts) {
        var myOpts = $.extend({
            onValue: ""
        }, opts);
        QualityDefinition.call(this, title, opts);
        this.onValue = myOpts.onValue;
    };
    OnOffQuality.inherits(QualityDefinition);
    OnOffQuality.prototype.format = function(character, value) {
        if (value) return this.onValue;
        else return null;
    };

    /* Defines a group of qualities that should be displayed together,
     * before any miscellaneous qualities. */
    var QualityGroup = function(title, opts) {
        var myOpts = $.extend({
            priority: title,
            extraClasses: null
        }, opts);
        this.title = title;
        this.priority = myOpts.priority;
        this.extraClasses = myOpts.extraClasses;
    };

    // -----------------------------------------------------------------------
    // Internal Types.
    // -----------------------------------------------------------------------

    /* The interface from Undum to situations. */
    var System = function () {
    };
    /* Outputs regular content to the page. The content supplied MUST
     * begin and end with HTML start/end tags. You could have several
     * paragraphs, however, as long as the content starts with the <p>
     * of the first paragraph, and ends with the </p> of the last. */
    System.prototype.write = function(content) {
        var output = augmentLinks(content);
        $('#content').append(output);
    };
    /* Begins a new heading on the page. You could write headings
     * using write, manually wrapping them in the appropriate
     * HTML. But it is strongly recommended that you use this method,
     * as in the future headings may receive additional processing for
     * indexing and javascript hooks. Do not wrap the content you pass
     * into this function in a HTML heading tag. That will be done for
     * you. The extraClasses parameter is there if you need to give
     * the resulting heading additional CSS classes; it should be an
     * array of strings. */
    System.prototype.writeHeading = function(content, extraClasses) {
        var h = $("<h1>").html(content);
        if (extraClasses) {
            for (var i = 0; i < extraClasses.length; i++) {
                h.addClass(extraClasses[i]);
            }
        }
        $('#content').append(augmentLinks(h));
    };

    /* Call this to change the character text: the text in the right
     * toolbar before the qualities list. The value you give can
     * contain links to situations.
     */
    System.prototype.setCharacterText = function(content) {
        var block = $("#character_text_content");
        var oldContent = block.html();
        var newContent = augmentLinks($("<div>").html(content));
        if (block.is(':visible')) {
            block.fadeOut(250, function() {
                block.html(newContent);
                block.fadeIn(750);
            });
            showHighlight($("#character_text"));
        } else {
            block.html(newContent);
        }
    };

    /* Call this to change the value of a character quality. Don't do
     * this by directly changing the quality, because that will not
     * update the UI. Because the character's sandbox isn't displayed,
     * you can modify that directly. */
    System.prototype.setQuality = function(quality, newValue) {
        var oldValue = character.qualities[quality];
        character.qualities[quality] = newValue;

        // Work out how to display the values.
        var newDisplay = newValue.toString();
        var qualityDefinition = game.qualities[quality];
        if (qualityDefinition) {
            newDisplay = qualityDefinition.format(character, newValue);
        }

        // Add the data block, if we need it.
        var qualityBlock = $("#q_"+quality);
        if (qualityBlock.size() <= 0) {
            if (newDisplay === null) return;
            qualityBlock = addQualityBlock(quality).hide().fadeIn(500);
        } else {
            // Do nothing if there's nothing to do.
            if (oldValue == newValue) return;

            // Change the value.
            if (newDisplay === null) {
                // Remove the block.
                qualityBlock.fadeOut(1000, function() {
                    var groupBlock = qualityBlock.parents('.quality_group');
                    qualityBlock.remove();
                    if (groupBlock.find('.quality').size() <= 0) {
                        groupBlock.remove();
                    }
                });
            } else {
                var valBlock = qualityBlock.find(".value");
                valBlock.fadeOut(250, function() {
                    valBlock.html(newDisplay);
                    valBlock.fadeIn(750);
                });
            }
        }
        showHighlight(qualityBlock);
    };
    /* Changes a quality to a new value, but also shows an animation
     * of the change. This probably only makes sense for qualities
     * that are numeric. */
    System.prototype.animateQuality = function(quality, newValue, opts) {
        // Overload default options.
        var myOpts = $.extend({
            from: 0,
            to: 1,
            title: null,
            showValue: true,
            displayValue: null,
            leftLabel: null,
            rightLabel: null
        }, opts);

        // Run through the quality definition.
        var qualityDefinition = game.qualities[quality];
        if (qualityDefinition) {
            // Work out how to display the value
            if (myOpts.displayValue === null) {
                myOpts.displayValue = qualityDefinition.format(
                    character, newValue
                );
            }

            // Use the title.
            if (myOpts.title === null) {
                myOpts.title = qualityDefinition.title;
            }
        }

        // Add the animated bar.
        var totalWidth = 496;
        var bar = $("<div>").addClass('progress_bar');
        bar.css('width', myOpts.from*totalWidth);
        var wrap = $("<div>").addClass('progress_bar_wrapper').html(bar);
        var section = $("<div>").addClass('progress_bar_section').html(wrap);
        $('#content').append(section);

        // Add labels
        if (myOpts.title) {
            section.prepend($("<span>").addClass('name').html(myOpts.title));
        }
        if (myOpts.showValue && myOpts.displayValue !== null) {
            section.prepend(
                $("<span>").addClass('value').html(myOpts.displayValue)
            );
        }
        if (myOpts.leftLabel) {
            var l = $("<span>").addClass('left_label');
            l.html(myOpts.leftLabel);
            section.append(l);
        }
        if (myOpts.rightLabel) {
            var l = $("<span>").addClass('right_label');
            l.html(myOpts.rightLabel);
            section.append(l);
        }

        // Start the animation
        setTimeout(function() {
            bar.animate({'width': myOpts.to*totalWidth}, 1000, function() {
                // After a moment to allow the bar to be read, we can
                // remove it.
                setTimeout(function() {
                    section.slideUp(1000, function() {
                        section.remove();
                    });
                }, 2000);
            });
        }, 500);

        // Change the base UI.
        this.setQuality(quality, newValue);
    };

    /* Constructor for character data. */
    var Character = function() {
        this.qualities = {};
        this.sandbox = {};
    };


    // -----------------------------------------------------------------------
    // Internal Data Structures
    // -----------------------------------------------------------------------

    /* The global system object. */
    var system = new System();

    /* The data structure holding the content for the game. This
     * should be static data. Anything that might change should be
     * stored in the character. */
    var game = {
        start: "start",
        situations: {},
        /* We can define these functions to do global processing. */
        init: null,
        enter: null,
        beforeAction: null,
        afterAction: null,
        exit: null
    };

    /* This is the character data that gets saved. It isn't the
     * character that the situations see, it holds other internal data
     * too. */
    var sysCharacter = {
        // The id of the current situation.
        current: null,
        // The character that the situations see and can manipulate.
        character: null
    };
    var character = null; // Convenience alias.

    // -----------------------------------------------------------------------
    // Utility Functions
    // -----------------------------------------------------------------------

    var getCurrentSituation = function() {
        if (sysCharacter.current) {
            return game.situations[sysCharacter.current];
        } else {
            return null;
        }
    };

    /* Adds the quality blocks to the character tools. */
    var showQualities = function() {
        $("#qualities").empty();
        for (var qualityId in character.qualities) {
            addQualityBlock(qualityId);
        }
    };

    /* Fades in and out a highlight on the given element. */
    var showHighlight = function(domElement) {
        var highlight = domElement.find(".highlight");
        if (highlight.size() <= 0) {
            highlight = $('<div>').addClass('highlight');
            domElement.append(highlight);
        }
        highlight.fadeIn(250);
        setTimeout(function() {
            highlight.fadeOut(1000);
        }, 2000);
    };

    /* Finds the correct location and inserts a particular DOM element
     * fits into an existing list of DOM elements. This is done by
     * priority order, so all elements (existing and new) must have
     * their data-priority attribute set. */
    var insertAtCorrectPosition = function(parent, newItem) {
        var newPriority = newItem.attr('data-priority');
        var children = parent.children();
        for (var i = 0; i < children.size(); i++) {
            var child = children.eq(i);
            if (newPriority < child.attr('data-priority')) {
                child.before(newItem);
                return;
            }
        }
        parent.append(newItem);
    };

    /* Adds a new group to the correct location in the quality list. */
    var addGroupBlock = function(groupId) {
        var groupDefinition = game.qualityGroups[groupId];

        // Build the group div with appropriate heading.
        var groupBlock = $("<div>").addClass("quality_group");
        groupBlock.attr("data-priority", groupDefinition.priority);
        groupBlock.attr("id", "g_"+groupId);
        if (groupDefinition.title) {
            groupBlock.append($("<h2>").html(groupDefinition.title));
        }
        if (groupDefinition.extraClasses) {
            for (var i = 0; i < groupDefinition.extraClasses.length; i++) {
                groupBlock.addClass(groupDefinition.extraClasses[i]);
            }
        }
        groupBlock.append($("<div>").addClass("qualities_in_group"));

        // Add the block to the correct place.
        var qualities = $("#qualities");
        insertAtCorrectPosition(qualities, groupBlock);
        return groupBlock;
    };

    /* Adds a new quality to the correct location in the quality list. */
    var addQualityBlock = function(qualityId) {
        // Make sure we want to display this quality.
        var qualityDefinition = game.qualities[qualityId];
        if (!qualityDefinition) return null;

        // Work out how the value should be displayed.
        var name = qualityDefinition.title;
        var val = qualityDefinition.format(
            character, character.qualities[qualityId]
        );
        if (val === null) return;

        // Create the quality output.
        var qualityBlock = $("<div>").addClass('quality');
        qualityBlock.attr("data-priority", qualityDefinition.priority);
        qualityBlock.attr("id", "q_"+qualityId);
        qualityBlock.append($("<span>").addClass("name").html(name));
        qualityBlock.append($("<span>").addClass("value").html(val));
        if (qualityDefinition.extraClasses) {
            for (var i = 0; i < qualityDefinition.extraClasses.length; i++) {
                qualityBlock.addClass(qualityDefinition.extraClasses[i]);
            }
        }

        // Find or create the group block.
        var groupId = qualityDefinition.group;
        if (groupId) {
            var group = game.qualityGroups[groupId];
            // assert(group);
            var groupBlock = $("#g_"+groupId);
            if (groupBlock.size() <= 0) {
                groupBlock = addGroupBlock(groupId);
            }
        }

        // Position it correctly.
        var groupQualityList = groupBlock.find(".qualities_in_group");
        insertAtCorrectPosition(groupQualityList, qualityBlock);
        return qualityBlock;
    };

    /* This gets called when the user clicks on a link. */
    var linkRe = /^([-a-z0-9]+|.)(\/([-0-9a-z]+))?$/;
    var processClick = function(code) {
        var match = code.match(linkRe);
        // assert(match);

        var situation = match[1];
        var action = match[3];

        // Change the situation
        if (situation != '.') {
            if (situation != sysCharacter.current) {
                doTransitionTo(situation);
            }
        } else {
            // We should have an action if we have no situation change.
            // assert(action);
        }

        // Carry out the action
        if (action) {
            var situation = getCurrentSituation();
            if (situation) {
                situation.act(character, system, action);
            }
        }

        // We're no longer disabled.
        $("#save").attr('disabled', false);
    };

    /* Transitions between situations. */
    var doTransitionTo = function(newSituationId) {
        var oldSituationId = sysCharacter.current;
        var oldSituation = getCurrentSituation();
        var newSituation = game.situations[newSituationId];

        // Notify the exiting situation, exit if we've finished or if
        // we're not allowed to enter the new situation.
        if (!oldSituation || !oldSituation.exit(
            character, system, newSituationId
        )) return;

        //  Remove links and transient sections.
        $('#content a').each(function (index, element) {
            var a = $(element);
            if (a.hasClass('sticky')) return;
            a.replaceWith($("<span>").addClass("ex_link").html(a.html()));
        });
        $('#content .transient').fadeOut(2000);

        // Move the character.
        sysCharacter.current = newSituationId;

        // Notify the incoming situation, unless we're ending.
        if (newSituation) {
            newSituation.enter(character, system, oldSituationId);
        }
    };

    /* Returns HTML from the given content with the non-raw links
     * wired up. */
    var augmentLinks = function(content) {
        var output = $(content);
        output.find("a").each(function(index, element) {
            var element = $(element);
            if (!element.hasClass("raw")) {
                element.click(function (event) {
                    event.preventDefault();
                    processClick(element.attr('href'));
                    return false;
                });
            }
        });
        return output;
    };

    /* Saves the character to local storage. */
    var doSave = function() {
        // Collect the data to save.
        sysCharacter.storySoFar = $("#content").html();
        sysCharacter.characterText = $("#character_text_content").html();
        localStorage['undum_character'] = JSON.stringify(sysCharacter);
        delete sysCharacter.storysoFar;
        delete sysCharacter.characterText;

        // Switch the button highlights.
        $("#erase").attr('disabled', false);
        $("#save").attr('disabled', true);
    };

    /* Erases the character in local storage. This is permanent! TODO:
     * Perhaps give a warning. */
    var doErase = function(force) {
        var message =
            "This will permanently delete this character. Are you sure?";

        if (localStorage['undum_character']) {
            if (force || confirm(message)) {
                delete localStorage['undum_character'];
                $("#erase").attr('disabled', true);
                startGame();
            }
        }
    };

    /* Set up the screen from scratch to reflect the current game
     * state. */
    var initGameDisplay = function() {
        // Transition into the first situation,
        $("#content").empty();
        var situation = getCurrentSituation();

        // assert(situation);
        situation.enter(character, system, null);
        showQualities();
    };

    /* Clear the current game output and start again. */
    var startGame = function() {
        // Create the character.
        character = sysCharacter.character = new Character();
        sysCharacter.current = game.start;
        if (game.init) game.init(character, system);

        initGameDisplay();
    };

    /* Loads the game from the given data */
    var loadGame = function(characterData) {
        sysCharacter = characterData;
        character = sysCharacter.character;

        $("#content").html(
            augmentLinks(sysCharacter.storySoFar)
        );
        delete sysCharacter.storysoFar;

        $("#character_text_content").html(
            augmentLinks(sysCharacter.characterText)
        );
        delete sysCharacter.characterText;

        showQualities();
    };

    // -----------------------------------------------------------------------
    // Setup and API
    // -----------------------------------------------------------------------

    /* Export our API. */
    window.undum = {
        Situation: Situation,
        SimpleSituation: SimpleSituation,
        ActionSituation: ActionSituation,

        QualityDefinition: QualityDefinition,
        IntegerQuality: IntegerQuality,
        NumericQuality: NumericQuality,
        WordScaleQuality: WordScaleQuality,
        OnOffQuality: OnOffQuality,

        QualityGroup: QualityGroup,

        game: game
    };

    /* Set up the game when everything is loaded. */
    $(function () {
        // Handle storage.
        if (hasLocalStorage) {
            var erase = $("#erase").click(function () {
                doErase();
            });
            var save = $("#save").click(doSave);

            var storedCharacter = localStorage['undum_character'];
            if (storedCharacter) {
                save.attr('disabled', true);
                erase.attr("disabled", false);
                try {
                    loadGame(JSON.parse(storedCharacter));
                } catch(err) {
                    doErase(true);
                }
            } else {
                save.attr('disabled', false);
                erase.attr("disabled", true);
                startGame();
            }
        } else {
            $("#buttons").html("<p>No local storage available.</p>");
            startGame();
        }

        // Show the tools when we click on the title.
        $("#title").one('click', function() {
            $("#content, #legal").fadeIn(500);
            $("#tools_wrapper").fadeIn(2000);
            $("#title").css("cursor", "default");
            $("#title .click_message").fadeOut(250);
        });
    })
})();