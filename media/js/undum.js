// ---------------------------------------------------------------------------
// UNDUM game library. This file needs to be supplemented with a game
// file (conventionally called "your-game-name.game.js" which will
// define the content of the game.
// ---------------------------------------------------------------------------

(function() {
    // -----------------------------------------------------------------------
    // Internal Infrastructure Implementations [NB: These have to be
    // at the top, because we use them below, but you can safely
    // ignore them and skip down to the next section.]
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
    // Types for Author Use
    // -----------------------------------------------------------------------

    /* The game is split into situations, which respond to user
     * choices. Situation is the base type. It has three methods:
     * enter, act and exit, which you implement to perform any
     * processing and output any content. The default implementations
     * do nothing.
     *
     * You can either create your own type of Situation, and add
     * enter, act and/or exit functions to the prototype (see
     * SimpleSituation or ActionSituation in this file for examples of
     * that), or you can give those functions in the opts
     * parameter. The opts parameter is an object. So you could write:
     *
     *    var situation = Situation({
     *        enter: function(character, system, from) {
     *            ... your implementation ...
     *        }
     *    });
     *
     * If you pass in enter, act and/or exit through these options,
     * then they should have the same function signature as the full
     * function definitions, below.
     *
     * Note that the derived types of Situation (SimpleSituation and
     * ActionSituation), call passed in functions AS WELL AS their
     * normal action. This is most often what you want: the normal
     * behavior plus a little extra custom behavior. If you want to
     * override the behavior of a SimpleSituation or ActionSituation,
     * you'll have to create a derived type and set the enter, act
     * and/or exit function on their prototypes. In most cases,
     * however, if you want to do something completely different, it
     * is better to derive your type from this type: Situation, rather
     * than one of its children.
     */
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

    /* A simple situation has a block of content that it displays when
     * the situation is entered. The content must be valid "Display
     * Content" (see `System.prototype.write` for a definition). It
     * has an optional `heading` (in the opts parameter) that will be
     * used as a section title before the content is displayed. The
     * heading can be any HTML string, it doesn't need to be "Display
     * Content". The remaining options in the opts parameter are the
     * same as for Situation.
     */
    var SimpleSituation = function(content, opts) {
        Situation.call(this, opts);
        this.content = content;
        this.heading = opts && opts.heading;
    }
    SimpleSituation.inherits(Situation);
    SimpleSituation.prototype.enter = function(character, system, from) {
        system.scrollHere();
        if (this.heading) system.writeHeading(this.heading);
        system.write(this.content);
        if (this._enter) this._enter(character, system, from);
    };

    /* An action situation is just like a simple situation, only it
     * has a number of responses to internal actions that can occur
     * without leaving the situation. The actions parameter should be
     * an object mapping the action id to a response. Responses can be
     * either a function(character, system, action) that returns a
     * string of content, or just the raw string of content. In either
     * case the content must be valid "Display Content" (see
     * `System.prototype.write` for a definition). If you give a
     * function, then the function may return null if it has no output
     * to send (e.g. it could use system.prototype.write internally to
     * write its output). Valid options in the opts parameter are the
     * same as for SimpleSituation.
     */
    var ActionSituation = function(content, actions, opts) {
        SimpleSituation.call(this, content, opts);
        this.actions = actions;
    };
    ActionSituation.inherits(SimpleSituation);
    ActionSituation.prototype.act = function(character, system, action) {
        system.scrollHere();
        response = this.actions[action];
        try {
            response = response(character, system, action);
        } catch (err) {
        }
        if (response) system.write(response);
        if (this._act) this._act(character, system, action);
    };


    /* Instances of this class define the qualities that characters
     * may possess. The title should be a string, and can contain
     * HTML. Options are passed in in the opts parameter. The
     * following options are available.
     *
     * priority - A string used to sort qualities within their
     *     groups. When the system displays a list of qualities they
     *     will be sorted by this string. If you don't give a
     *     priority, then the title will be used, so you'll get
     *     alphabetic order. Normally you either don't give a
     *     priority, or else use a priority string containing 0-padded
     *     numbers (e.g. "00001").
     *
     * group - The Id of a group in which to display this
     *     parameter. If a group is given, then it must be defined in
     *     your `undum.game.qualityGroups` property. If no group is
     *     given, then the quality will be placed at the end of the
     *     list.
     *
     * extraClasses - These classes will be attached to the <div> tag
     *     that surrounds the quality when it is displayed. A common
     *     use for this is to add icons representing the quality. In
     *     your CSS define a class for each icon, then pass those
     *     classes into the appropriate quality definitions.
     *
     * One key purpose of QualityDefinition is to format the quality
     * value for display. Quality values are always stored as numeric
     * values, but may be displayed in words or symbols. A number of
     * sub-types of QualityDefinition are given that format their
     * values in different ways.
     */
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

    /* A quality that is always displayed as the nearest integer of
     * the current value, rounded down. Options (in the opts
     * parameter) are the same as for QualityDefinition. */
    var IntegerQuality = function(title, opts) {
        QualityDefinition.call(this, title, opts);
    };
    IntegerQuality.inherits(QualityDefinition);
    IntegerQuality.prototype.format = function(character, value) {
        return parseInt(value).toString();
    };

    /* A quality that displays its full numeric value, including
     * decimal component. This is actually a trivial wrapper around
     * the QualityDefinition class, which formats in the same
     * way. Options (in the opts parameter) are the same as for
     * QualityDefinition. */
    var NumericQuality = function(title, opts) {
        QualityDefinition.call(this, title, opts);
    };
    NumericQuality.inherits(QualityDefinition);

    /* A quality that displays its values as one of a set of
     * words. The quality value is first rounded down to the nearest
     * integer, then this value is used to select a word to
     * display. The offset parameter (optionally passed in as part of
     * the opts object) controls what number maps to what word.
     *
     * The following options (in the opts parameter) are available:
     *
     * offset - With offset=0 (the default), the quantity value of 0
     *     will map to the first word, and so on. If offset is
     *     non-zero then the value given will correspond to the first
     *     word in the list. So if offset=4, then the first word in
     *     the list will be used for value=4.
     *
     * Other options are the same as for QualityDefinition.
     *
     * Words outside the range of the values given will be constructed
     * from the limits of the values given and an integer modifier. So
     * if the words are 'low', 'high' with no offset, a value of 2
     * will be 'high+1' and -2 will be 'low-2'.
     */
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
     * it has a zero value. If it has a non-zero value, its value
     * field is usually left empty, but you can specify your own
     * string to display as the `onValue` parameter of the opts
     * object. Other options (in the opts parameter) are the same as
     * for QualityDefinition. */
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
     * before any miscellaneous qualities. These should be defined in
     * the `undum.game.qualityGroups` parameter. */
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
    // Types Passed to Situations
    // -----------------------------------------------------------------------

    /* A system object is passed into the enter, act and exit
     * functions of each situation. It is used to interact with the
     * UI. */
    var System = function () {
    };

    /* Outputs regular content to the page. The content supplied must
     * be valid "Display Content".
     *
     * "Display Content" is any HTML string that begins with a HTML
     * start tag, ends with either an end or a closed tag, and is a
     * valid and self-contained snippet of HTML. Note that the string
     * doesn't have to consist of only one HTML tag. You could have
     * several paragraphs, for example, as long as the content starts
     * with the <p> of the first paragraph, and ends with the </p> of
     * the last. So "<p>Foo</p><img src='bar'>" is valid, but "foo<img
     * src='bar'>" is not.
     */
    System.prototype.write = function(content) {
        var output = augmentLinks(content);
        var content = $('#content').append(output);
    };

    /* Call this method before doing a chunk of writing, so that the
     * client will elegantly scroll to that location. This doesn't
     * happen automatically, because you may want to write several
     * chunks in one go, and it would be annoying to scroll to the
     * bottom of those. */
    System.prototype.scrollHere = function() {
        var body = $("body,html");
        var content = $("#content");
        body.animate(
            {scrollTop:content.scrollTop() + content.height()},
            500
        );
    };

    /* Begins a new heading on the page. You could write headings
     * using write, manually wrapping them in the appropriate
     * HTML. But it is strongly recommended that you use this method.
     * In the future headings may receive additional processing for
     * indexing and javascript hooks.
     *
     * There is no need to return "Display Cotnent" from this method,
     * any content will do. Do not wrap the content you pass into this
     * function in a HTML heading tag. That will be done for you. You
     * can, however, use other tags, such as <em> and <span> in your
     * heading.
     *
     * The extraClasses parameter is there if you need to give the
     * resulting heading additional CSS classes; it should be an array
     * of strings.
     */
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
     * toolbar before the qualities list. This text is designed to be
     * a short description of the current state of your character. The
     * content you give should be "Display Content" (see
     * `System.prototype.write` for the definition).
     */
    System.prototype.setCharacterText = function(content) {
        var block = $("#character_text_content");
        var oldContent = block.html();
        var newContent = augmentLinks(content);
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

    /* Call this to change the value of a character quality. Don't
     * directly change quality values, because that will not update
     * the UI. (You can change any data in the character's sandbox
     * directly, however, since that isn't displayed). */
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

    /* Changes a quality to a new value, but also shows a progress bar
     * animation of the change. This probably only makes sense for
     * qualities that are numeric, especially ones that the player is
     * grinding to increase. The quality and newValue parameters are
     * as for setQuality. The progress bar is controlled by the
     * following options in the opts parameter:
     *
     * from - The proportion along the progress bar where the
     *     animation starts. Defaults to 0, valid range is 0-1.
     *
     * to - The proportion along the progress bar where the
     *     animation ends. Defaults to 1, valid range is 0-1.
     *
     * showValue - If true (the default) then the new value of the
     *     quality is displayed above the progress bar.
     *
     * displayValue - If this is given, and showValue is true, then
     *     the displayValue is used above the progress bar. If this
     *     isn't given, and showValue is true, then the display value
     *     will be calculated from the QualityDefinition, as
     *     normal. This option is useful for qualities that don't have
     *     a definition, because they don't normally appear in the UI.
     *
     * title - The title of the progress bar. If this is not given,
     *     then the title of the quality is used. As for displayValue
     *     this is primarily used when the progress bar doesn't have a
     *     QualityDefinition, and therefore doesn't have a title.
     *
     * leftLabel, rightLabel - Underneath the progress bar you can
     *     place two labels at the left and right extent of the
     *     track. These can help to give scale to the bar. So if the
     *     bar signifies going from 10.2 to 10.5, you might label the
     *     left and right extents with "10" and "11" respectively. If
     *     these are not given, then the labels will be omitted.
     */
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

    /* The character that is passed into each situation is of this
     * form.
     *
     * The `qualities` data member maps the Ids of each quality to its
     * current value. When implementing enter, act or exit functions,
     * you should consider this to be read-only. Make all
     * modifications through `System.prototype.setQuality`, or
     * `System.prototype.animateQuality`. In your `init` function, you
     * can set these values directly.
     *
     * The `sandbox` data member is designed to allow your code to
     * track any data it needs to. The only proviso is that the data
     * structure should be serializable into JSON (this means it must
     * only consist of primitive types [objects, arrays, numbers,
     * booleans, strings], and it must not contain circular series of
     * references). The data in the sandbox is not displayed in the
     * UI, although you are free to use it to create suitable output
     * for the player..
     */
    var Character = function() {
        this.qualities = {};
        this.sandbox = {};
    };

    /* The data structure holding the content for the game. By default
     * this holds nothing. It is this data structure that is populated
     * in the `.game.js` file. Each element in the structure is
     * commented, below.
     *
     * This should be static data that never changes through the
     * course of the game. It is never saved, so anything that might
     * change should be stored in the character.
     */
    var game = {

        // Situations

        /* An object mapping from the unique id of each situation, to
         * the situation object itself. This is the heart of the game
         * specification. */
        situations: {},

        /* The unique id of the situation to enter at the start of a
         * new game. */
        start: "start",


        // Quality display definitions

        /* An object mapping the unique id of each quality to its
         * QualityDefinition. You don't need definitions for every
         * quality, but only qualities in this mapping will be
         * displayed in the character box of the UI. */
        qualities: {},

        /* Qualities can have an optional group Id. This maps those
         * Ids to the group definitions that says how to format its
         * qualities.
         */
        qualityGroups: {},


        // Hooks

        /* This function is called at the start of the game. It is
         * normally overridden to provide initial character creation
         * (setting initial quality values, setting the
         * character-text. This is optional, however, as set-up
         * processing could also be done by the first situation's
         * enter function. If this function is given it should have
         * the signature function(character, system).
         */
        init: null,

        /* This function is called before entering any new
         * situation. It is called before the corresponding situation
         * has its `enter` method called. It can be used to implement
         * timed triggers, but is totally optional. If this function
         * is given it should have the signature:
         *
         * function(character, system, oldSituationId, newSituationId);
         */
        enter: null,

        /* This function is called before carrying out any action in
         * any situation. It is called before the corresponding
         * situation has its `act` method called. If this optional
         * function is given it should have the signature:
         *
         * function(character, system, situationId, actionId);
         */
        beforeAction: null,

        /* This function is called after carrying out any action in
         * any situation. It is called after the corresponding
         * situation has its `act` method called. If this optional
         * function is given it should have the signature:
         *
         * function(character, system, situationId, actionId);
         */
        afterAction: null,

        /* This function is called after leaving any situation. It is
         * called after the corresponding situation has its `exit`
         * method called. Like that method, it shoudld return true if
         * it wants the transition to go ahead, or false to stop
         * it. If this optional function is given it should have the
         * signature:
         *
         * function(character, system, oldSituationId, newSituationId);
         */
        exit: null
    };

    // =======================================================================

    // Code below doesn't form part of the public API for UNDUM, so
    // you shouldn't find you need to use it.

    // -----------------------------------------------------------------------
    // Internal Data Structures
    // -----------------------------------------------------------------------

    /* The global system object. */
    var system = new System();

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
                if (game.beforeAction) {
                    game.beforeAction(
                        character, system, sysChar.current, action
                    );
                }
                situation.act(character, system, action);
                if (game.afterAction) {
                    game.afterAction(
                        character, system, sysChar.current, action
                    );
                }
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
        if (!oldSituation) return;
        if (!oldSituation.exit(character, system, newSituationId)) return;
        if (game.exit) {
            if (!game.exit(character, system, oldSituationId, newSituationId)){
                return;
            }
        }

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
            if (game.enter) {
                game.enter(character, system, oldSituationId, newSituationId);
            }
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
                var href = element.attr('href');
                if (href.match(linkRe)) {
                    element.click(function (event) {
                        event.preventDefault();
                        processClick(href);
                        return false;
                    });
                } else {
                    element.addClass("raw");
                }
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
        if (game.enter) {
            game.enter(character, system, null, sysChar.current);
        }
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
    // Setup
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