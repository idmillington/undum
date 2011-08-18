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
    Function.prototype.inherits = function(Parent) {
        var d = {}, p = (this.prototype = new Parent());
        this.prototype.uber = function(name) {
            if (!(name in d)) d[name] = 0;
            var f, r, t = d[name], v = Parent.prototype;
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

    // Feature detection

    var hasLocalStorage = function() {
        return ('localStorage' in window) && window.localStorage !== null;
    };

    var isMobileDevice = function() {
        return (navigator.userAgent.toLowerCase().search(
            /iphone|ipad|palm|blackberry|android/
        ) >= 0 || $("html").width() <= 640);
    };

    // Assertion

    var AssertionError = function(message) {
        this.message = message;
        this.name = AssertionError;
    };
    AssertionError.inherits(Error);

    var assert = function(expression, message) {
        if (!expression) {
            throw new AssertionError(message);
        }
    };

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
     * SimpleSituation in this file for an example of that), or you
     * can give those functions in the opts parameter. The opts
     * parameter is an object. So you could write:
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
     * Note that the derived types of Situation (current
     * SimpleSituation), call passed in functions AS WELL AS their
     * normal action. This is most often what you want: the normal
     * behavior plus a little extra custom behavior. If you want to
     * override the behavior of a SimpleSituation, you'll have to
     * create a derived type and set the enter, act and/or exit
     * function on their prototypes. In most cases, however, if you
     * want to do something completely different, it is better to
     * derive your type from this type: Situation, rather than one of
     * its children.
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
     * parameter indicates the situation we are going to. */
    Situation.prototype.exit = function(character, system, to) {
        if (this._exit) this._exit(character, system, to);
    };

    /* A simple situation has a block of content that it displays when
     * the situation is entered. The content must be valid "Display
     * Content" (see `System.prototype.write` for a definition). This
     * constructor has options that control its behavior:
     *
     * heading: The optional `heading` will be used as a section title
     *     before the content is displayed. The heading can be any
     *     HTML string, it doesn't need to be "Display Content". If
     *     the heading is not given, no heading will be displayed.
     *
     * actions: This should be an object mapping action Ids to a
     *     response. The response should either be "Display Content"
     *     to display if this action is carried out, or it should be a
     *     function(character, system, action) that will process the
     *     action.
     *
     * The remaining options in the opts parameter are the same as for
     * the base Situation.
     */
    var SimpleSituation = function(content, opts) {
        Situation.call(this, opts);
        this.content = content;
        this.heading = opts && opts.heading;
        this.actions = opts && opts.actions;
    };
    SimpleSituation.inherits(Situation);
    SimpleSituation.prototype.enter = function(character, system, from) {
        if (this.heading) {
            if ($.isFunction(this.heading)) {
                system.writeHeading(this.heading());
            } else {
                system.writeHeading(this.heading);
            }
        }
        if (this.content) {
            if ($.isFunction(this.content)) {
                system.write(this.content());
            } else {
                system.write(this.content);
            }
        }
        if (this._enter) this._enter(character, system, from);
    };
    SimpleSituation.prototype.act = function(character, system, action) {
        var response = this.actions[action];
        try {
            response(character, system, action);
        } catch (err) {
            if (response) system.write(response);
        }
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
     *     parameter. The corresponding group must be defined in
     *     your `undum.game.qualityGroups` property.
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
        return Math.floor(value).toString();
    };

    /* A quality that displays as an IntegerQuality, unless it is
     * zero, when it is omitted. Options (in the opts * parameter) are
     * the same as for QualityDefinition. */
    var NonZeroIntegerQuality = function(title, opts) {
        IntegerQuality.call(this, title, opts);
    };
    NonZeroIntegerQuality.inherits(IntegerQuality);
    NonZeroIntegerQuality.prototype.format = function(character, value) {
        if (value == 0) {
            return null;
        } else {
            return IntegerQuality.prototype.format.call(
                this, character, value
            );
        }
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
     * useBonuses - If this is true (the default), then values outside
     *     the range of words will be construced from the word and a
     *     numeric bonus. So with offset=0 and five words, the last of
     *     which is 'amazing', a score of six would give 'amazing+1'.
     *     if this is false, then the bonus would be omitted, so
     *     anything beyond 'amazing' is still 'amazing'.
     *
     * Other options are the same as for QualityDefinition.
     */
    var WordScaleQuality = function(title, values, opts) {
        var myOpts = $.extend({
            offset: null,
            useBonuses: true
        }, opts);
        QualityDefinition.call(this, title, opts);
        this.values = values;
        this.offset = myOpts.offset;
        this.useBonuses = myOpts.useBonuses;
    };
    WordScaleQuality.inherits(QualityDefinition);
    WordScaleQuality.prototype.format = function(character, value) {
        var val = Math.floor(value - this.offset);
        var mod = "";
        if (val < 0) {
            mod = val.toString();
            val = 0;
        } else if (val >= this.values.length) {
            mod = "+" + (val - this.values.length + 1).toString();
            val = this.values.length - 1;
        }
        if (!this.useBonuses) mod = "";
        return this.values[val] + mod;
    };

    /* A specialization of WordScaleQuality that uses the FUDGE RPG's
     * adjective scale (from 'terrible' at -3 to 'superb' at +3). The
     * options are as for WordScaleQuality. In particular you can use
     * the offset option to control where the scale starts. So you
     * could model a quality that everyone starts off as 'terrible'
     * (such as Nuclear Physics) with an offset of 0, while another that
     * is more common (such as Health) could have an offset of -5 so
     * everyone starts with 'great'.
     */
    var FudgeAdjectivesQuality = function(title, opts) {
        WordScaleQuality.call(this, title, [
            "terrible".l(), "poor".l(), "mediocre".l(),
            "fair".l(), "good".l(), "great".l(), "superb".l()
        ], opts);
        if (!('offset' in opts)) this.offset = -3;
    };
    FudgeAdjectivesQuality.inherits(WordScaleQuality);

    /* An boolean quality that removes itself from the quality list if
     * it has a zero value. If it has a non-zero value, its value
     * field is usually left empty, but you can specify your own
     * string to display as the `onDisplay` parameter of the opts
     * object. Other options (in the opts parameter) are the same as
     * for QualityDefinition. */
    var OnOffQuality = function(title, opts) {
        var myOpts = $.extend({
            onDisplay: ""
        }, opts);
        QualityDefinition.call(this, title, opts);
        this.onDisplay = myOpts.onDisplay;
    };
    OnOffQuality.inherits(QualityDefinition);
    OnOffQuality.prototype.format = function(character, value) {
        if (value) return this.onDisplay;
        else return null;
    };

    /* A boolean quality that has different output text for zero or
     * non-zero quality values. Unlike OnOffQuality, this definition
     * doesn't remove itself from the list when it is 0. The options
     * are as for QualityDefinition, with the addition of options
     * 'yesDisplay' and 'noDisplay', which contain the HTML fragments
     * used to display true and false values. If not given, these
     * default to 'yes' and 'no'.
     */
    var YesNoQuality = function(title, opts) {
        var myOpts = $.extend({
            yesDisplay: "yes".l(),
            noDisplay: "no".l()
        }, opts);
        QualityDefinition.call(this, title, opts);
        this.yesDisplay = myOpts.yesDisplay;
        this.noDisplay = myOpts.noDisplay;
    };
    YesNoQuality.inherits(QualityDefinition);
    YesNoQuality.prototype.format = function(character, value) {
        if (value) return this.yesDisplay;
        else return this.noDisplay;
    };

    /* Defines a group of qualities that should be displayed together,
     * under the given optional title. These should be defined in the
     * `undum.game.qualityGroups` parameter. */
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
     * UI.
     */
    var System = function() {
        this.rnd = null;
        this.time = 0;
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
     *
     * The content goes to the end of the page, unless you supply the
     * optional selector argument. If you do, the content appears
     * after the element that matches that selector.
     */
    System.prototype.write = function(content, elementSelector) {
        doWrite(content, elementSelector, 'append', 'after');
    };

    /* Outputs regular content to the page. The content supplied must
     * be valid "Display Content".
     *
     * The content goes to the beginning of the page, unless you
     * supply the optional selector argument. If you do, the content
     * appears after the element that matches that selector.
     */
    System.prototype.writeBefore = function(content, elementSelector) {
        doWrite(content, elementSelector, 'prepend', 'before');
    };

    /* Carries out the given situation change or action, as if it were
     * in a link that has been clicked. This allows you to do
     * procedural transitions. You might have an action that builds up
     * the character's strength, and depletes their magic. When the
     * magic is all gone, you can force a situation change by calling
     * this method. */
    System.prototype.doLink = function(code) {
        processLink(code);
    };

    /* Turns any links that target the given href into plain
     * text. This can be used to remove action options when an action
     * is no longer available. It is used automatically when you give
     * a link the 'once' class. */
    System.prototype.clearLinks = function(code) {
        $("a[href='" + code + "']").each(function(index, element) {
            var a = $(element);
            a.replaceWith($("<span>").addClass("ex_link").html(a.html()));
        });
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
        if (interactive && block.is(':visible')) {
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
        if (!interactive) return;

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
                // Remove the block, and possibly the whole group, if
                // it is the last quality in the group.
                var toRemove = null;
                var groupBlock = qualityBlock.parents('.quality_group');
                if (groupBlock.find('.quality').size() <= 1) {
                    toRemove = groupBlock;
                } else {
                    toRemove = qualityBlock;
                }

                toRemove.fadeOut(1000, function() {
                    toRemove.remove();
                });
            } else {
                var valBlock = qualityBlock.find("[data-attr='value']");
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
        var currentValue = character.qualities[quality];
        if (!currentValue) currentValue = 0;

        // Change the base UI.
        this.setQuality(quality, newValue);
        if (!interactive) return;

        // Overload default options.
        var myOpts = {
            from: 0,
            to: 1,
            title: null,
            showValue: true,
            displayValue: null,
            leftLabel: null,
            rightLabel: null
        };
        if (newValue < currentValue) {
            myOpts.from = 1;
            myOpts.to = 0;
        }
        $.extend(myOpts, opts);

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

        // Create the animated bar.
        var totalWidth = 496;
        var bar = $("#ui_library #progress_bar").clone();
        bar.removeAttr("id");
        var widthElement = bar.find("[data-attr='width']");
        widthElement.css('width', myOpts.from*totalWidth);

        // Configure its labels
        var titleLabel = bar.find("[data-attr='name']");
        var valueLabel = bar.find("[data-attr='value']");
        var leftLabel = bar.find("[data-attr='left_label']");
        var rightLabel = bar.find("[data-attr='right_label']");
        if (myOpts.title) {
            titleLabel.html(myOpts.title);
        } else {
            titleLabel.remove();
        }
        if (myOpts.showValue && myOpts.displayValue !== null) {
            valueLabel.html(myOpts.displayValue);
        } else {
            valueLabel.remove();
        }
        if (myOpts.leftLabel) {
            leftLabel.html(myOpts.leftLabel);
        } else {
            leftLabel.remove();
        }
        if (myOpts.rightLabel) {
            rightLabel.html(myOpts.rightLabel);
        } else {
            rightLabel.remove();
        }
        $('#content').append(bar);

        // Start the animation
        setTimeout(function() {
            widthElement.animate(
                {'width': myOpts.to*totalWidth}, 1000,
                function() {
                    // After a moment to allow the bar to be read, we can
                    // remove it.
                    setTimeout(function() {
                        if (mobile) {
                            bar.fadeOut(1500, function() {$(this).remove();});
                        } else {
                            bar.animate({opacity: 0}, 1500).
                                slideUp(500, function() {
                                    $(this).remove();
                                });
                        }
                    }, 2000);
                }
            );
        }, 500);
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
         *
         * If the function returns true, then it is indicating that it
         * has consumed the action, and the action will not be passed
         * on to the situation. Note that this is the only one of
         * these global handlers that can consume the event.
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
         * method called. If this optional function is given it should
         * have the signature:
         *
         * function(character, system, oldSituationId, newSituationId);
         */
        exit: null
    };

    // =======================================================================

    // Code below doesn't form part of the public API for UNDUM, so
    // you shouldn't find you need to use it.

    // -----------------------------------------------------------------------
    // Internal Data
    // -----------------------------------------------------------------------

    /* The global system object. */
    var system = new System();

    /* This is the data on the player's progress that gets saved. */
    var progress = {
        // A random seed string, used internally to make random
        // sequences predictable.
        seed: null,
        // Keeps track of the links clicked, and when.
        sequence: [],
        // The time when the progress was saved.
        saveTime: null
    };

    /* The Id of the current situation the player is in. */
    var current = null;

    /* This is the current character. It should be reconstructable
     * from the above progress data. */
    var character = null;

    /* Tracks whether we're in interactive mode or batch mode. */
    var interactive = true;

    /* Tracks whether we're mobile or not. */
    var mobile = isMobileDevice();

    /* The system time when the game was initialized. */
    var startTime;

    /* The stack of links, resulting from the last action, still be to
     * resolved. */
    var linkStack = null

    // -----------------------------------------------------------------------
    // Utility Functions
    // -----------------------------------------------------------------------

    var getCurrentSituation = function() {
        if (current) {
            return game.situations[current];
        } else {
            return null;
        }
    };

    /* Outputs regular content to the page. Used by write and
     * writeBefore, the last two arguments control what jQuery methods
     * are used to add the content.
     */
    var doWrite = function(content, selector, addMethod, appendMethod) {
        continueOutputTransaction();
        var output = augmentLinks(content);
        var element;
        if (selector) element = $(selector);
        if (!element) {
            $('#content')[addMethod](output);
        }
        else {
            element[appendMethod](output);
        }
        /* We want to scroll this new element to the bottom of the screen.
         * while still being visible. The easiest way is to find the
         * top edge of the *following* element and move that exactly
         * to the bottom (while still ensuring that this element is fully
         * visible.) */
        var nextel = output.last().next();
        var scrollPoint;
        if (!nextel.length)
            scrollPoint = $("#content").height() + $("#title").height() + 60;
        else
            scrollPoint = nextel.offset().top - $(window).height();
        if (scrollPoint > output.offset().top)
            scrollPoint = output.offset().top;
        scrollStack[scrollStack.length-1] = scrollPoint;
    };

    /* Gets the unique id used to identify saved games. */
    var getSaveId = function() {
        return 'undum_'+game.id+"_"+game.version;
    }

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
        var groupBlock = $("#ui_library #quality_group").clone();
        groupBlock.attr("id", "g_"+groupId);
        groupBlock.attr("data-priority", groupDefinition.priority);

        var titleElement = groupBlock.find("[data-attr='title']");
        if (groupDefinition.title) {
            titleElement.html(groupDefinition.title);
        } else {
            titleElement.remove();
        }

        if (groupDefinition.extraClasses) {
            for (var i = 0; i < groupDefinition.extraClasses.length; i++) {
                groupBlock.addClass(groupDefinition.extraClasses[i]);
            }
        }

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
        var qualityBlock = $("#ui_library #quality").clone();
        qualityBlock.attr("id", "q_"+qualityId);
        qualityBlock.attr("data-priority", qualityDefinition.priority);
        qualityBlock.find("[data-attr='name']").html(name);
        qualityBlock.find("[data-attr='value']").html(val);
        if (qualityDefinition.extraClasses) {
            for (var i = 0; i < qualityDefinition.extraClasses.length; i++) {
                qualityBlock.addClass(qualityDefinition.extraClasses[i]);
            }
        }

        // Find or create the group block.
        var groupBlock;
        var groupId = qualityDefinition.group;
        if (groupId) {
            var group = game.qualityGroups[groupId];
            assert(group, "no_group_definition".l({id: groupId}));
            groupBlock = $("#g_"+groupId);
            if (groupBlock.size() <= 0) {
                groupBlock = addGroupBlock(groupId);
            }
        }

        // Position it correctly.
        var groupQualityList = groupBlock.find(".qualities_in_group");
        insertAtCorrectPosition(groupQualityList, qualityBlock);
        return qualityBlock;
    };

    /* Output events are tracked, so we can make sure we scroll
     * correctly. We do this in a stack because one click might cause
     * a chain reaction. Of output events, only when we return to the
     * top level will we do the scroll.
     *
     * However, that leaves the question of where to scroll *to*.
     * (Remember that elements could be inserted anywhere in the
     * document.) Whenever we do a write(), we'll have to update the
     * top (last) stack element to that position.
     */
    var scrollStack = [];
    var pendingFirstWrite = false;
    var startOutputTransaction = function() {
        if (scrollStack.length == 0) {
            pendingFirstWrite = true;
        }
        // The default is "all the way down".
        scrollStack.push(
            $("#content").height() + $("#title").height() + 60
        );
    };
    var continueOutputTransaction = function() {
        if (pendingFirstWrite) {
            pendingFirstWrite = false;
            var separator = $("#ui_library #turn_separator").clone();
            separator.removeAttr("id");
            $("#content").append(separator);
        }
    };
    var endOutputTransaction = function() {
        var scrollPoint = scrollStack.pop();
        if (scrollStack.length == 0 && scrollPoint != null) {
            if (interactive && !mobile) {
                $("body, html").animate({scrollTop: scrollPoint}, 500);
            }
            scrollPoint = null;
        }
    };

    /* This gets called when a link needs to be followed, regardless
     * of whether it was user action that initiated it. */
    var linkRe = /^([-a-z0-9]+|\.)(\/([-0-9a-z]+))?$/;
    var processLink = function(code) {
        // Check if we should do this now, or if processing is already
        // underway.
        if (linkStack !== null) {
            linkStack.push(code);
            return;
        }

        // Track where we're about to add new content.
        startOutputTransaction();

        // We're processing, so make the stack available.
        linkStack = [];

        // Handle each link in turn.
        processOneLink(code);
        while (linkStack.length > 0) {
            code = linkStack.shift();
            processOneLink(code);
        }

        // We're done, so remove the stack to prevent future pushes.
        linkStack = null;

        // Scroll to the top of the new content.
        endOutputTransaction();

        // We're able to save, if we weren't already.
        $("#save").attr('disabled', false);
    };

    /* This gets called to actually do the work of processing a code.
     * When one doLink is called (or a link is clicked), this may set call
     * code that further calls doLink, and so on. This method processes
     * each one, and processLink manages this.
     */
    var processOneLink = function(code) {
        var match = code.match(linkRe);
        assert(match, "link_not_valid".l({link:code}));

        var situation = match[1];
        var action = match[3];

        // Change the situation
        if (situation !== '.') {
            if (situation !== current) {
                doTransitionTo(situation);
            }
        } else {
            // We should have an action if we have no situation change.
            assert(
                action, "link_no_action".l()
            );
        }

        // Carry out the action
        if (action) {
            situation = getCurrentSituation();
            if (situation) {
                if (game.beforeAction) {
                    // Try the global act handler, and see if we need
                    // to notify the situation.
                    var consumed = game.beforeAction(
                        character, system, current, action
                    );
                    if (consumed !== true) {
                        situation.act(character, system, action);
                    }
                } else {
                    // We have no global act handler, always notify
                    // the situation.
                    situation.act(character, system, action);
                }
                if (game.afterAction) {
                    game.afterAction(character, system, current, action);
                }
            }
        }
    };

    /* This gets called when the user clicks a link to carry out an
     * action. */
    var processClick = function(code) {
        var now = (new Date()).getTime() * 0.001;
        system.time = now - startTime;
        progress.sequence.push({link:code, when:system.time});
        processLink(code);
    };

    /* Transitions between situations. */
    var doTransitionTo = function(newSituationId) {
        var oldSituationId = current;
        var oldSituation = getCurrentSituation();
        var newSituation = game.situations[newSituationId];

        assert(newSituation, "unknown_situation".l({id:newSituationId}));

        // We might not have an old situation if this is the start of
        // the game.
        if (oldSituation) {
            // Notify the exiting situation.
            oldSituation.exit(character, system, newSituationId);
            if (game.exit) {
                game.exit(character, system, oldSituationId, newSituationId);
            }

            //  Remove links and transient sections.
            $('#content a').each(function(index, element) {
                var a = $(element);
                if (a.hasClass('sticky')) return;
                a.replaceWith($("<span>").addClass("ex_link").html(a.html()));
            });
            if (interactive) {
                if (mobile) {
                    $('#content .transient, #content ul.options').
                        fadeOut(2000);
                } else {
                    $('#content .transient, #content ul.options').
                        animate({opacity: 0}, 1500).
                        slideUp(500, function() {
                            $(this).remove();
                        });
                }
            } else {
                $('#content .transient, #content ul.options').remove();
            }
        }

        // Move the character.
        current = newSituationId;

        // Notify the incoming situation.
        if (game.enter) {
            game.enter(character, system, oldSituationId, newSituationId);
        }
        newSituation.enter(character, system, oldSituationId);
    };

    /* Returns HTML from the given content with the non-raw links
     * wired up. */
    var augmentLinks = function(content) {
        var output = $(content);

        // Wire up the links for regular <a> tags.
        output.find("a").each(function(index, element) {
            var a = $(element);
            if (!a.hasClass("raw")) {
                var href = a.attr('href');
                if (href.match(linkRe)) {
                    a.click(function(event) {
                        event.preventDefault();
                        processClick(href);

                        // If we're a once-click, remove all matching
                        // links after we're clicked.
                        if (a.hasClass("once")) {
                            system.clearLinks(href);
                        }

                        return false;
                    });
                } else {
                    a.addClass("raw");
                }
            }
        });

        return output;
    };

    /* Erases the character in local storage. This is permanent! TODO:
     * Perhaps give a warning. */
    var doErase = function(force) {
        var saveId = getSaveId()
        if (localStorage[saveId]) {
            if (force || confirm("erase_message".l())) {
                delete localStorage[saveId];
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
        assert(
            situation, "no_current_situation".l()
        );

        showQualities();
    };

    /* Clear the current game output and start again. */
    var startGame = function() {
        progress.seed = new Date().toString();

        character = new Character();
        system.rnd = new Random(progress.seed);
        progress.sequence = [{link:game.start, when:0}];

        // Empty the display
        $("#content").empty();

        // Start the game
        startTime = new Date().getTime() * 0.001;
        system.time = 0;
        if (game.init) game.init(character, system);
        showQualities();

        // Do the first state.
        doTransitionTo(game.start);
    };

    /* Saves the character to local storage. */
    var saveGame = function() {
        // Store when we're saving the game, to avoid exploits where a
        // player loads their file to gain extra time.
        var now = (new Date()).getTime() * 0.001;
        progress.saveTime = now - startTime;

        // Save the game.
        localStorage[getSaveId()] = JSON.stringify(progress);

        // Switch the button highlights.
        $("#erase").attr('disabled', false);
        $("#save").attr('disabled', true);
    };

    /* Loads the game from the given data */
    var loadGame = function(characterData) {
        progress = characterData;

        character = new Character();
        system.rnd = new Random(progress.seed);

        // Empty the display
        $("#content").empty();
        showQualities();

        // Now play through the actions so far:
        if (game.init) game.init(character, system);

        // Run through all the player's history.
        interactive = false;
        for (var i = 0; i < progress.sequence.length; i++) {
            var step = progress.sequence[i];
            // The action must be done at the recorded time.
            system.time = step.when;
            processLink(step.link);
        }
        interactive = true;

        // Reverse engineer the start time.
        var now = new Date().getTime() * 0.001;
        startTime = now - progress.saveTime;

        // Because we did the run through non-interactively, now we
        // need to update the UI.
        showQualities();
    };

    // -----------------------------------------------------------------------
    // Setup
    // -----------------------------------------------------------------------

    /* Export our API. */
    window.undum = {
        Situation: Situation,
        SimpleSituation: SimpleSituation,

        QualityDefinition: QualityDefinition,
        IntegerQuality: IntegerQuality,
        NonZeroIntegerQuality: NonZeroIntegerQuality,
        NumericQuality: NumericQuality,
        WordScaleQuality: WordScaleQuality,
        FudgeAdjectivesQuality: FudgeAdjectivesQuality,
        OnOffQuality: OnOffQuality,
        YesNoQuality: YesNoQuality,

        QualityGroup: QualityGroup,

        game: game,

        // The undum set of translated strings.
        language: {}
    };

    /* Set up the game when everything is loaded. */
    $(function() {
        // Handle storage.
        if (hasLocalStorage) {
            var erase = $("#erase").click(function() {
                doErase();
            });
            var save = $("#save").click(saveGame);

            var storedCharacter = localStorage[getSaveId()];
            if (storedCharacter) {
                try {
                    loadGame(JSON.parse(storedCharacter));
                    save.attr('disabled', true);
                    erase.attr("disabled", false);
                } catch(err) {
                    doErase(true);
                }
            } else {
                save.attr('disabled', true);
                erase.attr("disabled", true);
                startGame();
            }
        } else {
            $("#buttons").html("<p>"+"no_local_storage".l()+"</p>");
            startGame();
        }

        // Display the "click to begin" message. (We do this in code
        // so that, if Javascript is off, it doesn't happen.)
        $(".click_message").show();

        // Show the game when we click on the title.
        $("#title").one('click', function() {
            $("#content_wrapper, #legal").fadeIn(500);
            $("#tools_wrapper").fadeIn(2000);
            $("#title").css("cursor", "default");
            $("#title .click_message").fadeOut(250);
            if (mobile) {
                $("#toolbar").slideDown(500);
                $("#menu").show();
            }
        });

        // Any point that an option list appears, its options are its
        // first links.
        $("ul.options li, #menu li").live('click', function(event) {
            // Make option clicks pass through to their first link.
            var link = $("a", this);
            if (link.length > 0) {
                $(link.get(0)).click();
            }
        });

        // Switch between the two UIs as we resize.
        var resize = function() {
            // Work out if we're mobile or not.
            var wasMobile = mobile;
            mobile = isMobileDevice();

            if (wasMobile != mobile) {
                var showing = !$(".click_message").is(":visible");
                if (mobile) {
                    var menu = $("#menu")
                    if (showing) {
                        $("#toolbar").show();
                        menu.show();
                    }
                    menu.css('top', -menu.height()-52);
                    // Go to the story view.
                    $("#character_panel, #info_panel").hide();
                } else {
                    // Use the full width version
                    $("#toolbar").hide();
                    $("#menu").hide();
                    if (showing) {
                        // Display the side bars
                        $("#tools_wrapper").show();
                    }
                    $("#character_panel, #info_panel").show();
                }
                $("#title").show();
                if (showing) $("#content_wrapper").show();
            }
        };
        $(window).bind('resize', resize);
        resize();

        // Handle display of the menu and resizing: used on mobile
        // devices and an small screens.
        initMenu();
    });

    var initMenu = function() {
        var menu = $("#menu");

        var menuVisible = false;
        var open = function() {
            menu.animate({top:48}, 500);
            menuVisible = true;
        };
        var close = function() {
            menu.animate({top:-menu.height()-52}, 250);
            menuVisible = false;
        };
        menu.css('top', -menu.height()-52);

        // Slide up and down on clicks from the main button.
        $("#menu-button").click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (menuVisible) {
                close();
            } else {
                open();
            }
            return false;
        });

        // Register for clicks on the individual menu items: show the
        // relevant item.
        $("#menu a").click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            var target = $($(this).attr('href'));
            if (!target.is(":visible")) {
                // Fade out those we don't want.
                $("#menu a").each(function() {
                    var href = $(this).attr('href');
                    if (href != target) {
                        $(href).fadeOut(250);
                    }
                });
                // Fade in our target
                setTimeout(function() { target.fadeIn(500); }, 250);
            }
            close();
            return false;
        });
    };

    // -----------------------------------------------------------------------
    // Contributed Code
    // -----------------------------------------------------------------------

    // Internationalization support based on the code provided by Oreolek.
    (function() {
        var codesToTry = {};
        /* Compiles a list of fallback languages to try if the given code
         * doesn't have the message we need. Caches it for future use. */
        var getCodesToTry = function(languageCode) {
            var codeArray;
            if (codeArray = codesToTry[languageCode]) return codeArray;

            codeArray = [];
            if (languageCode in undum.language) {
                codeArray.push(languageCode);
            }
            var elements = languageCode.split('-');
            for (var i = elements.length-2; i > 0; i--) {
                var thisCode = elements.slice(0, i).join('-');
                if (thisCode in undum.language) {
                    codeArray.push(thisCode);
                }
            }
            codeArray.push("");
            codesToTry[languageCode] = codeArray;
            return codeArray;
        };
        var lookup = function(languageCode, message) {
            var languageData = undum.language[languageCode];
            if (!languageData) return null;
            return languageData[message];
        };
        var localize = function(languageCode, message) {
            var localized, thisCode;
            var languageCodes = getCodesToTry(languageCode);
            for (var i = 0; i < languageCodes.length; i++) {
                thisCode = languageCodes[i];
                if (localized = lookup(thisCode, message)) return localized;
            }
            return message;
        };

        // API
        String.prototype.l = function(args) {
            // Get lang attribute from html tag.
            var lang = $("html").attr("lang");

            // Find the localized form.
            var localized = localize(lang, this);

            // Merge in any replacement content.
            if (args) {
                for (var name in args) {
                    localized = localized.replace(
                        new RegExp("\\{"+name+"\\}"), args[name]
                    );
                }
            }
            return localized;
        };
    })();

    // Random Number generation based on seedrandom.js code by David Bau.
    // Copyright 2010 David Bau, all rights reserved.
    //
    // Redistribution and use in source and binary forms, with or
    // without modification, are permitted provided that the following
    // conditions are met:
    //
    //   1. Redistributions of source code must retain the above
    //      copyright notice, this list of conditions and the
    //      following disclaimer.
    //
    //   2. Redistributions in binary form must reproduce the above
    //      copyright notice, this list of conditions and the
    //      following disclaimer in the documentation and/or other
    //      materials provided with the distribution.
    //
    //   3. Neither the name of this module nor the names of its
    //      contributors may be used to endorse or promote products
    //      derived from this software without specific prior written
    //      permission.
    //
    // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
    // CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
    // INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
    // MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    // DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
    // CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
    // NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    // LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
    // HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
    // CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
    // OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
    // EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    var Random = (function() {
        // Within this closure function the code is basically
        // David's. Undum's custom extensions are added to the
        // prototype outside of this function.
        var width = 256;
        var chunks = 6;
        var significanceExponent = 52;
        var startdenom = Math.pow(width, chunks);
        var significance = Math.pow(2, significanceExponent);
        var overflow = significance * 2;

        var Random = function(seed) {
            this.random = null;
            if (!seed) throw {
                name: "RandomSeedError",
                message: "random_seed_error".l()
            };
            var key = [];
            mixkey(seed, key);
            var arc4 = new ARC4(key);
            this.random = function() {
                var n = arc4.g(chunks);
                var d = startdenom;
                var x = 0;
                while (n < significance) {
                    n = (n + x) * width;
                    d *= width;
                    x = arc4.g(1);
                }
                while (n >= overflow) {
                    n /= 2;
                    d /= 2;
                    x >>>= 1;
                }
                return (n + x) / d;
            };
        };
        // Helper type.
        var ARC4 = function(key) {
            var t, u, me = this, keylen = key.length;
            var i = 0, j = me.i = me.j = me.m = 0;
            me.S = [];
            me.c = [];
            if (!keylen) { key = [keylen++]; }
            while (i < width) { me.S[i] = i++; }
            for (i = 0; i < width; i++) {
                t = me.S[i];
                j = lowbits(j + t + key[i % keylen]);
                u = me.S[j];
                me.S[i] = u;
                me.S[j] = t;
            }
            me.g = function getnext(count) {
                var s = me.S;
                var i = lowbits(me.i + 1); var t = s[i];
                var j = lowbits(me.j + t); var u = s[j];
                s[i] = u;
                s[j] = t;
                var r = s[lowbits(t + u)];
                while (--count) {
                    i = lowbits(i + 1); t = s[i];
                    j = lowbits(j + t); u = s[j];
                    s[i] = u;
                    s[j] = t;
                    r = r * width + s[lowbits(t + u)];
                }
                me.i = i;
                me.j = j;
                return r;
            };
            me.g(width);
        };
        // Helper functions.
        var mixkey = function(seed, key) {
            seed += '';
            var smear = 0;
            for (var j = 0; j < seed.length; j++) {
                var lb = lowbits(j);
                smear ^= key[lb];
                key[lb] = lowbits(smear*19 + seed.charCodeAt(j));
            }
            seed = '';
            for (j in key) {
                seed += String.fromCharCode(key[j]);
            }
            return seed;
        };
        var lowbits = function(n) {
            return n & (width - 1);
        };

        return Random;
    })();
    /* Returns a random floating point number between zero and
     * one. NB: The prototype implementation below just throws an
     * error, it will be overridden in each Random object when the
     * seed has been correctly configured. */
    Random.prototype.random = function() {
        throw new {
            name:"RandomError",
            message: "random_error".l()
        };
    };
    /* Returns an integer between the given min and max values,
     * inclusive. */
    Random.prototype.randomInt = function(min, max) {
        return min + Math.floor((max-min+1)*this.random());
    };
    /* Returns the result of rolling n dice with dx sides, and adding
     * plus. */
    Random.prototype.dice = function(n, dx, plus) {
        var result = 0;
        for (var i = 0; i < n; i++) {
            result += this.randomInt(1, dx);
        }
        if (plus) result += plus;
        return result;
    };
    /* Returns the result of rolling n averaging dice (i.e. 6 sided dice
     * with sides 2,3,3,4,4,5). And adding plus. */
    Random.prototype.aveDice = (function() {
        var mapping = [2,3,3,4,4,5];
        return function(n, plus) {
            var result = 0;
            for (var i = 0; i < n; i++) {
                result += mapping[this.randomInt(0, 5)];
            }
            if (plus) result += plus;
            return result;
        };
    })();
    /* Returns a dice-roll result from the given string dice
     * specification. The specification should be of the form xdy+z,
     * where the x component and z component are optional. This rolls
     * x dice of with y sides, and adds z to the result, the z
     * component can also be negative: xdy-z. The y component can be
     * either a number of sides, or can be the special values 'F', for
     * a fudge die (with 3 sides, +,0,-), '%' for a 100 sided die, or
     * 'A' for an averaging die (with sides 2,3,3,4,4,5).
     */
    Random.prototype.diceString = (function() {
        var diceRe = /^([1-9][0-9]*)?d([%FA]|[1-9][0-9]*)([-+][1-9][0-9]*)?$/;
        return function(def) {
            var match = def.match(diceRe);
            if (!match) {
                throw new Error(
                    "dice_string_error".l({string:def})
                );
            }

            var num = match[1]?parseInt(match[1], 10):1;
            var sides;
            var bonus = match[3]?parseInt(match[3], 10):0;

            switch (match[2]) {
            case 'A':
                return this.aveDice(num, bonus);
            case 'F':
                sides = 3;
                bonus -= num*2;
                break;
            case '%':
                sides = 100;
            default:
                sides = parseInt(match[2], 10);
                break;
            }
            return this.dice(num, sides, bonus);
        };
    })();

    // -----------------------------------------------------------------------
    // Default Messages
    // -----------------------------------------------------------------------
    var en = {
        terrible: "terrible",
        poor: "poor",
        mediocre: "mediocre",
        fair: "fair",
        good: "good",
        great: "great",
        superb: "superb",
        yes: "yes",
        no: "no",
        no_group_definition: "Couldn't find a group definition for {id}.",
        link_not_valid: "The link '{link}' doesn't appear to be valid.",
        link_no_action: "A link with a situation of '.', must have an action.",
        unknown_situation: "You can't move to an unknown situation: {id}.",
        erase_message: "This will permanently delete this character and immediately return you to the start of the game. Are you sure?",
        no_current_situation: "I can't display, because we don't have a current situation.",
        no_local_storage: "No local storage available.",
        random_seed_error: "You must provide a valid random seed.",
        random_error: "Initialize the Random with a non-empty seed before use.",
        dice_string_error: "Couldn't interpret your dice string: '{string}'."
    };
    // Set this data as both the default fallback language, and the english
    // preferred language.
    undum.language[""] = en;
    undum.language["en"] = en;
})();
