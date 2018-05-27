# Javascript API

# `Character`

The character is created for you, but is passed into most of the
functions that you define. It consists of an object with no methods
and two properties:

#### `qualities`

The qualities object maps quality identifiers to their current
value. Your code finds the current value associated with a quality by
reading from this object, for example:

    var gold = character.qualities.gold;

To set a quality, you have two choices. If you know the quality you
want to set will not appear in the user interface, then you can set it
directly:

    character.qualities.gold += 1;

If it does appear on-screen, then this approach will mean that the
character panel doesn't update, and the screen will be out of sync
with the actual value. Instead it is better to use the `System` method
`setQuality`, which also updates the UI:

    system.setQuality('gold', character.qualities.gold+1);

It is fine to use `setQuality` if the quality isn't visible, making
this the preferred option for all quality modifications.

#### `sandbox`

Not every bit of data you want to associate with a character fits
nicely into a quality. The sandbox is a general storage space for any
further data you want to store in the course of your game, for
example:

    character.sandbox.roomsSearched.push('bathroom');

Sandbox data is never visible to the user, so you can use any data
structures you like here, to any depth.

# `System`

The system represents the interface between your code and the
user-interface.  You don't create your own `System` object, it is
passed into your code.

#### `clearContent(elementSelector)`

*Since version 2*

Removes all content from the page, clearing the main content area.

Although Undum is designed to keep the flow of the narrative on one
page, sometimes you do need to start a new page, and this allows you
to do so.

The `elementSelector` is options. If you give it, then the DOM element
matching the selector is cleared, rather than the whole document.

#### `write(content, elementSelector)`

Writes new content to the main flow of the story. The content you pass
in must be either valid DOM elements already, or else be a string
containing text in Display Content format.

The `elementSelector` is optional. If you provide it, then the new
content will be added after the DOM element in the document that
matches the selector. This allows you to do out-of-order addition of
content. Simply add a paragraph with an id in your game, then later
you can give this id as a selector to write, and the new content will
be inserted immediately following that paragraph, regardless of how
much extra content has been added since that point. If no selector is
given then `#content` is used, i.e. the content is added at the end of
the document. The `writeBefore` method inserts content at the start of
the document, or before a selector.

The story will scroll to the start of the insertion point. If you do
not wish to animate this scrolling, but just jump right there, you can
switch off jQuery's animation system by adding `jQuery.fx.off=true` to
your initialization code. This is particularly useful when debugging.

#### `writeHeading(content, elementSelector)`

Writes new content into the story and formats it as a heading. This
method work exactly as `write`, but wraps the content you provide into
a `h1` html tag.

#### `writeBefore(content, elementSelector)`

Writes content into the story. This method is identical to `write`,
above, except that the content is written at the start of the story,
or if a selector is given, inserted before the matching element. On
browsers that support it, the story will be scrolled to the insertion
point.

#### `writeInto(content, elementSelector)`

Writes content into the element matched by `elementSelector`. When
used without specifying a selector, this method is identical to
`write`. When a selector is supplied, the content is written as an
additional child node of the matched element, instead of as a new
node just after that element, as is the case with `write`.

#### `replaceWith(content, elementSelector)`

Replaces an element with `content`. If `elementSelector` isn't
supplied, this will replace the entire situation with the given
`content`. If it is, the matched element will be replaced, including
the matched set of tags; `content` slides in place of the matched
element in the DOM.

#### `writeChoices(listOfSituationIds)`

*Since version 2*

Creates a standard block of choices, one for each of the given
situation ids. The text used in the links will be whatever is returned
by the situation's `optionText` method. In addition, if the
situation's `canChoose` method returns `false`, then the option will
be displayed, but will not be clickable.

#### `getSituationIdChoices(listOfIdsOrTags, minChoices, maxChoices)`

*Since version 2*

This function is a complex and powerful way of compiling implicit
situation choices. You give it a list of situation ids and situation
tags. Tags should be prefixed with a hash # to differentiate them from
situation ids. The function then considers all matching situations in
descending priority order, calling their canView functions and
filtering out any that should not be shown, given the current
state. Without additional parameters the function returns a list of
the situation ids at the highest level of priority that has any valid
results. So, for example, if a tag #places matches three situations,
one with priority 2, and two with priority 3, and all of them can be
viewed in the current context, then only the two with priority 3 will
be returned. This allows you to have high-priority situations that
trump any lower situations when they are valid, such as situations
that force the player to go to one destination if the player is out of
money, for example.

If a `minChoices` value is given, then the function will attempt to
return at least that many results. If not enough results are available
at the highest priority, then lower priorities will be considered in
turn, until enough situations are found. In the example above, if we
had a minChoices of three, then all three situations would be
returned, even though they have different priorities. If you need to
return all valid situations, regardless of their priorities, set
minChoices to a large number, such as `Number.MAX_VALUE`, and leave
maxChoices undefined.

If a `maxChoices` value is given, then the function will not return any
more than the given number of results. If there are more than this
number of results possible, then the highest priority resuls will be
guaranteed to be returned, but the lowest priority group will have to
fight it out for the remaining places. In this case, a random sample
is chosen, taking into account the frequency of each situation. So a
situation with a frequency of 100 will be chosen 100 times more often
than a situation with a frequency of 1, if there is one space
available. Often these frequencies have to be taken as a guideline,
and the actual probabilities will only be approximate. Consider three
situations with frequencies of 1, 1, 100, competing for two
spaces. The 100-frequency situation will be chosen almost every time,
but for the other space, one of the 1-frequency situations must be
chosen. So the actual probabilities will be roughly 50%, 50%,
100%. When selecting more than one result, frequencies can only be a
guide.

Before this function returns its result, it sorts the situations in
increasing order of their `displayOrder` properties.


#### `doLink(URL)`

Carries out the action associated with the given URL, as if it had
been the `href` of a HTML link that the user clicked. This allows you
to procedurally change situation and carry out actions from your code.

#### `rnd`

This holds a general purpose random number generator. It is an object
derived from the `Random` prototype, so see `Random` below for details
on its API.

#### `time`

This is a numeric value holding the current time, in seconds, since
the player began playing the game. This value is correctly propagated
across saves, so it is the only way you should track timing. In
particular you should never call `new Date()` and use that value to
determine the outcome of any event. You can use the current date to
display the current date, for example, but not to control what actions
or situations are available. See the section on Loading and Saving for
more details of why this is important.

#### `setQuality(qualityId, newValue)`

Sets the character's given quality to the given value. This function
also updates the character panel, animating the change in value if
that is necessary. Do not directly set quality values in the
character, because the user-interface will not detect and reflect
those changes.

#### `animateQuality(qualityId, newValue, options)`

Like `setQuality`, this function changes the current value of the
given quality. In addition, however, it displays a progress bar that
shows to the user how the value has changed. The `options` parameter
should be an object containing options for how the bar should
display. The available options are:

- `from`: The proportion along the progress bar where the animation
   starts. Defaults to 0, valid range is 0-1.

- `to`: The proportion along the progress bar where the animation
   ends. Defaults to 1, valid range is 0-1.

- `showValue`: If `true` (the default) then the new value of the
   quality is displayed above the progress bar.

- `displayValue`: If this is given, and `showValue` is `true`, then
   the given value is used above the progress bar. If this isn't
   given, and `showValue` is `true`, then the display value will be
   calculated from the `QualityDefinition`, as normal. This option is
   useful for qualities that don't have a definition, because they
   don't normally appear in the UI.

- `title`: The title of the progress bar. If this is not given, then
   the title of the quality is used. As for `displayValue` this is
   primarily used when the progress bar doesn't have a
   `QualityDefinition`, and therefore doesn't have a title.

- `leftLabel`, `rightLabel`: Underneath the progress bar you can place
   two labels at the left and right extent of the track. These can
   help to give scale to the bar. So if the bar signifies going from
   10.2 to 10.5, you might label the left and right extents with "10"
   and "11" respectively and have the `from` and `to` value be 0.2 and
   0.5 respectively. If these are not given, then the labels will be
   omitted.

#### `setCharacterText(content)`

Sets the block of character text that appears in the character
panel. As for the `write` method, this text should be either valid DOM
elements, or a string meeting the Display Content requirements.

#### `clearLinks(URL)`

Call this function with an Undum link URL (e.g. `ballroom`, or
`ballroom/open-cabinet`). It will remove all occurrences of that link
from the page. This is equivalent to what happens when you change
situation, or when you click a link marked with the `once` CSS
class. It allows you to control what options are available
dynamically, from your code.

## `Random`

The `Random` object provides a set of tools for simple random number
generation, in a way that is guaranteed to work with the Loading and
Saving functionality in Undum. An instance of `Random` is provided in
the `rnd` property of the `System` object, so you will never need to
create your own. It has the following methods:

#### `random()`

Generates a random number between 0 and 1, where 0 is inclusive, and 1
is exclusive. You can use this to check against known probabilities,
such as:

    if (system.rnd.random() > 0.5) {
        ...
    }

To check for a 50/50 chance.

#### `randomInt(min, max)`

Return a random number between the given two values, where both values
are inclusive. So `randomInt(2,3)` generates either 2 or 3.

#### `dice(n, dx, plus)`

Rolls _n_ dice with _dx_ sides and adds _plus_ to the result. This
allows you to easily get results for rolls from regular RPG-style
games, such as 3d6+2. The `plus` parameter may be negative or
positive.

#### `aveDice(n, plus)`

Rolls _n_ averaging dice, and adds _plus_ to the result. Averaging dice
are a special type of d6 with sides marked [2,3,3,4,4,5]. They represent
the fact that most people are fairly average, and results should not lie
at the extremes.

#### `diceString(definition)`

Rolls dice according to the given definition string. The string should
be of the form xdy+z, where the x component and z component are
optional. This rolls x dice of with y sides, and adds z to the result,
the z component can also be negative: xdy-z. The y component can be
either a number of sides, or can be the special values 'F', for a
fudge die (with 3 sides, +,0,-), '%' for a 100 sided die, or 'A' for
an averaging die (with sides 2,3,3,4,4,5).

# `Situation`

The `Situation` object is the prototype of all the situations in your
game. It can be used directly, or through its more common derived
type, `SimpleSituation`. The base `Situation` gives you maximum
flexibility, but `SimpleSituation` provides more functionality and can
produce terser code.

#### `new Situation(options)`

Creates a new situation. The options array can specify your
implementation for any or all of the following methods of this class:

- `enter`
- `exit`
- `act`
- `optionText`
- `canView`
- `canChoose`

(see below for explanations of those methods). This allows
you to easily create situations that override certain behaviors with
code such as:

    Situation({
        enter: function(character, system, from) {
            ... your implementation ...
        }
    });

without having to subclass `Situation` to provide your own
implementations.

In addition the following options can be passed in.

- `tags`: A list of tags with which to label this situation. These are
primarily used to generate implicit lists of choices with
`System.getSituationIdChoices`. Tags are arbitrary strings. You can
pass a list of strings, or a single string. If you pass a single
string, it will be split at spaces, commas and tabs to form a list of
tags. For this reason, tags normally do not contain spaces, commas or
tabs (though if you pass in a list, and don't expect Undum to do the
splitting for you, you can include any characters you like in a tag).

- `optionText` (as a string): If given as a string, rather than a
function, this text will be returned whenever `optionText(...)` is
called.

- `displayOrder`: A numeric value, defaults to 1. When displaying
lists of implicitly generated choices, the options be displayed in
increasing value of this parameter.

- `priority`: Can be any number, defaults to 1. When generating lists
of choices implicitly, situations are considered in descending
priority order. If higher priority situations can be displayed, lower
priority situations will be hidden. See `System.getSituationIdChoices`
for details of the algorithm.

- `frequency`: Any number, defaults to 1. When generating lists of
implicit choices, where there are more choices available that slots to
display them, situations will be chosen randomly, with a probability
based on this value. See `System.getSituationIdChoices` for details of
the algorithm.

#### `enter(character, system, from)`

This is called when Undum enters a situation. The `character` and
`system` are instances of `Character` and `System` as described
above. The `from` parameter is a string containing the situation
identifier for the situation that we're arriving from.

This method is the most commonly overridden. It is commonly used to
describe the current situation (by sending content to
`system.write()`) and to update the character (by calling
`system.setQuality()` or by changing data in the character's `sandbox`
object)..

#### `exit(character, system, to)`

This method takes the same `character` and `system` parameters as
`enter`. Its third parameter, `to`, is a string containing the
identifier of the situation we're exiting to.

#### `act(character, system, action)`

This method again takes the same `character` and `system` parameters
as before. Its third parameter is a string containing the action
identifier corresponding to the link the player clicked. It is common
to use an `if` statement or a `switch` to query this action identifier
and decide what to do accordingly. For situations in which many
different actions are possible, consider using the `SimpleSituation`
prototype, which provides this switching behavior for you.

#### `optionText(character, system, hostSituation)`

This method is called by `System.writeChoices` to generate a label for
links to this situation. The `hostSituation` is the situation that has
asked for the choices to be displayed.

#### `canView(character, system, hostSituation)`

This method is called by `System.getSituationIdChoices` to determine
whether this situation can be part of a list of choices in the current
game state. It should return true or false.

#### `canChoose(character, system, hostSituation)`

This method is called by `System.writeChoices` to determine whether a
link should be added to allow the user to enter this situation. If
not, the choice will still appear, but will not be clickable.



## SimpleSituation

This prototype builds on the basic `Situation`, providing tools to
make it easy to output content in the `enter` method, and to switch
between different functions depending on the action identifier passed
into the `act` method. The `exit` method of `SimpleSituation` is
exactly as for the base type `Situation`.

#### `new SimpleSituation(content, options)`

Creates a new simple situation that will display the given content
when its `enter` method is called. The given options dictionary
provides further control of the behavior of this type. Valid options
are:

- `enter`: Providing an enter function in the `options` parameter
   allows you to add additional behavior to the enter method. Your
   custom function will be called *in addition to* and *after* the
   default content is written to the screen. You cannot override
   `SimpleSituation`'s `enter` method by providing this function. To
   override the method, you would have to create a derived type. If
   you provide an `enter` function, it should have the same form as
   `Situation.enter`.

- `act`: Pass in a function to add additional behavior to the act
   method. As for `enter`, your method is called *in addition to* and
   *after* the built-in functionality.

- `exit`: Because `SimpleSituation` has no default behavior for
   `exit`, any function you pass in here will be the only exit
   behavior for the object you are creating.

- `heading`: The `content` that you specify will be written out
   verbatim.  You can include headings in this content. Often it is
   more convenient to pass in just the text in the `content`
   parameter. In that case you may define this `heading` parameter to
   display a heading before the text. Unlike `content`, this doesn't
   need to conform to the Display Content requirements.

- `actions`: This should be an object that maps action identifiers to
   responses. A response should be either some Display Content to
   write to the screen, or a function that will process that
   request. These functions should have the same signature as the
   `Situation.act` method. Each function will only be called if the
   situation receives a call to `act` with its corresponding
   identifier. This allows you to simply define functions that only
   get called when particular actions happen.

- `choices`: An optional list of tags and situation-ids, with tags
  prefixed by a has symbol to distinguish them from situation ids. If
  given, this will cause the SimpleSituation to output an implicit block
  of choices after the content.

- `minChoices`: If you have given a `choices` definition, you can set
  this to an integer value to change the number of choices that will
  appear. See `System.getSituationIdChoices` for more information on
  how this affects the output.

- `maxChoices`: If you have given a `choices` definition, you can set
  this to an integer value to change the number of choices that will
  appear. See `System.getSituationIdChoices` for more information on
  how this affects the output.

An example `SimpleSituation` definition might be:

    new SimpleSituation(
        "<p>...content...</p>",
        {
            heading: "Title",
            actions: {
                listen: function(character, system, action) {
                    if (character.qualities.hearing > 5) {
                        system.write("<p>You hear a tinkling inside.</p>");
                    } else {
                        system.write("<p>You hear nothing.</p>");
                    }
                },
                search: "<p>You find nothing.</p>"
            }
        }
    );

notice how the `listen` function is responsible for its own output,
where the `search` property is a string in Display Content format,
ready for output.

#### Functions in `SimpleSituation`

Both the `content` and the `heading` of a simple situation can be
provided either as plain text, or as a function. If you provide a
function, then it will be called with no arguments, and it should
return a string to use for the output. This enables `SimpleSituation`
to be used with other formatting and templating systems.

# QualityDefinition

Quality definitions tell Undum how and where to display a quality in
the character panel. Each quality definition has one method, `format`,
which is responsible for converting a numeric quality value into a
displayable quantity.

You define your qualities in your `undum.game.qualities` property.


#### `new QualityDefinition(title, options)`

Creates a new `QualityDefinition`. It is rare to call this constructor
yourself, most often one of the derived types of `QualityDefinition`
are used. They are defined below.

The `title` should be a string, and can contain HTML. It is used to
label the quality in the character panel. It can be any string, it
doesn't have to be in Display Content format.

Options are passed in in the `options` parameter. The following
options are available.

- `priority`: A string used to sort qualities within their
   groups. When the system displays a list of qualities they will be
   sorted by this string. If you don't give a priority, then the title
   will be used, so you'll get alphabetic order. Normally you either
   don't give a priority, or else use a priority string containing
   0-padded numbers (e.g. "00001").

- `group`: The identifier of a group in which to display this
   parameter. If a group is given, then it must be defined in your
   `undum.game.qualityGroups` property.

- `extraClasses`: These classes will be attached to the `<div>` tag
   that surrounds the quality when it is displayed. A common use for
   this is to add icons representing the quality. In your CSS define a
   class for each icon, then pass those classes into the appropriate
   quality definitions.

#### `format(character, value)`

This is called by Undum to get a human readable string representing
the given quality value for the given character. The method may return
an empty string if the value has no need to be displayed, or it may
return `null` if the quantity itself shouldn't be displayed. The
difference here is significant. If your `QualityDefinition` returns
the empty string, then the quality will appear in the character panel,
but it will have no value marked. If it returns `null`, then it will
be removed from the character panel entirely.

Most commonly the `character` parameter is ignored, but in your own
derived types you can take advantage of being able to access other
information about the character.

You may call this function yourself, but there is commonly no need. It
will be called by Undum any time the corresponding quality needs to be
displayed.

## `IntegerQuality`

This is a derived type of `QualityDefinition` that displays the
quality value by rounding it down to the nearest integer. This is
ideal for most numeric statistics.

## `NonZeroIntegerQuality`

This is a derived type of `IntegerQuality` that only displays its
value when it is non-zero. If it is non-zero then it formats in the
same way as `IntegerQuality`. Whereas `IntegerQuality` whould show
zero values as '0', this type of quality displays nothing.

## `NumericQuality`

This is a derived type of `QualityDefinition` that displays the
quality value directly, as a full floating point value.

## `WordScaleQuality`

Sometimes you want qualities displayed in words rather than
numbers. This is a derived type of `QualityDefinition` that allows you
to define words corresponding to possible quality values.

#### `new WordScaleQuality(title, words, options)`

The `title` parameter is exactly as for `QualityDefinition`.

The `words` parameter determines what words will be used. It should be
an array of strings. By default the first string will be used to
represent a value of zero (after rounding down), and the second string
a value of 1, and so on to the end of the array. Values outside the
array are treated differently depending on the value of `useBonuses`
in the `options` parameter.

The `options` parameter supports the same three options as
`QualityDefinition`. It also takes the following additional
parameters:

- `offset`: With offset=0 (the default), a quantity value of 0 will
   map to the first word, and so on. If offset is non-zero then the
   value given will correspond to the first word in the list. So if
   offset=4, then the first word in the list will be used for value=4,
   the second for value=5. You can specify a non-integer offset value,
   in this case the offset is applied *before* the value is rounded
   down.

- `useBonuses`: If this is true (the default), then values outside the
   range of words will be constructed from the word and a numeric
   bonus. So with offset=0 and five words, the last of which is
   'amazing', a score of six would give 'amazing+1'.  if this is
   false, then the bonus would be omitted, so anything beyond
   'amazing' is still 'amazing'.

## `FudgeAdjectivesQuality`

This is a derived type of `WordScaleQuality` that doesn't require you
to specify the words you wish to use. It uses the word scale from the
Fudge RPG: "terrible", "poor", "mediocre", "fair", "good", "great" and
"superb".

#### `new FudgeAdjectivesQuality(title, options)`

The parameters `title` and `options` are as for the `WordScaleQuality`
constructor. The `offset` option defaults to -3, however (in
`WordScaleQuality` it defaults to 0), making "fair" the display value
for 0.

## `OnOffQuality`

An `OnOffQuality` returns `null` from its `format` method
(i.e. removes itself from the character panel) when the corresponding
quality value is zero. Otherwise it returns the empty string (i.e. it
is shown in the panel, but doesn't have a value label). See
`QualityDisplay.format` above for more details on this distinction.

#### `new OnOffQuality(title, options)`

The constructor for this type is the same as for `QualityDefinition`
from which it is derived. It accepts one extra option:

- `onDisplay`: If given, then rather than displaying the empty string,
   it displays the given string when its corresponding value is
   non-zero. This can be used to display a check-mark, for example
   (`{onDisplay:"&#10003;"}`), or even a HTML `img` tag.

## YesNoQuality

A `YesNoQuality` displays one of two strings depending whether its
value is zero or not.

#### `new YesNoQuality(title, options)`

The constructor for this type is the same as for `QualityDefinition`
from which it is derived. It accepts two extra options:

- `yesDisplay`, `noDisplay`: Either or both of these may be given. If
   they are given, then they should be set to a string, which will be
   used to indicate non-zero or zero values, respectively. By default
   "yes" and "no" are used.

# `QualityGroup`

A quality group defines a set of qualities that should be displayed
together in the character panel, under an optional subheading. You
could use quality groups to distinguish between qualities representing
a character's innate abilities and their equipment, for example.

You define your quality groups in your `undum.game.qualityGroups`
property.


#### `new QualityGroup(title, options)`

Constructs a new quality group that will have the given `title` for a
subheading. The title may be `null`, indicating that this group does
not need a heading.

The `options` parameter should be an object with the given optional
parameters:

- `priority`: A string used to sort quality groups. When the system
   displays more than one quality group, they will be sorted by this
   string. If you don't give a priority, then the title will be used,
   so you'll get alphabetic order. Normally you either don't give a
   priority, or else use a priority string containing 0-padded numbers
   (e.g. "00001").

- `extraClasses`: These classes will be attached to the `<div>` tag
   that surrounds the entire quality group when it is displayed. You
   can use this in addition to your CSS to radically change the way
   certain qualities are displayed.
