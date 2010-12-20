# API Documentation

# High Level Overview

Undum games area based around three concepts: Situations, Actions and
Qualities.

## Situations

A situation is a chunk of code that is responsible for adding content
to the screen and responding to user interaction. All user interaction
is performed by clicking links in the content.

Often a link will change the current situation, in which case another
situation is loaded, can write to the screen, and can begin responding
to user interaction. When a situation changes, all links that were
previously available are removed, so that the player can't unfairly go
back and try alternative options after committing to one. It is
possible to override this behavior, see the section on 'Sticky',
below.

There is always exactly one active situation. These situations, and
the links between them, form the structure of the game.

## Actions

A situation may offer the player a series of actions to perform. These
actions are internal to that situation and normally do not cause the
situation to change. Actions may output more content, including new
links for the user to select.

## Qualities

Qualities represent the current state of the character. Internally
they are all numeric values, able to take on any decimal value,
positive or negative.  They have no meaning to Undum - they are given
meaning by your code as you perform calculations or make decisions
based on their value.

Qualities display themselves to the user through a formatting
function, which can turn the number into any kind of indicator: a
progress bar, a symbol, a word, an integer, and so on. So as far as
the user is concerned, qualities can represent any kind of value.

## Other Concepts

There are a handful of other elements to an Undum game, but they are
very much in a supporting role. Quality groups allow you to display a
set of qualities under a common heading; and character text is a short
chunk of HTML that you can use to summarize a character's qualities,
or to give hints.


# HTML

All of Undum's output is HTML. This allows you to style your content
in any way you choose. It also allows you to include rich media into
your output, such as images, video or audio.

## Display Content

All HTML output should be in a format we call "Display Content" - this
has particular rules:

* Display Content must always start and end with a HTML tag. It may
  consist of more than one tag internally, however. So we can have the
  structure: `<p>...</p><img>`, for example, but not `some
  text...<img>`.

* It must be a complete snippet of HTML in its own right. So any tags
  that represent a range of content must have their closing tags
  present. So we can do `<p><em>...</em></p>`, but not
  `<p><em>...</p>`.

## CSS Styles

Undum also uses some of HTML's capabilities to control its own
behavior. In particular, it uses a series of CSS classes to control
how content behaves.

#### `class="transient"`

The CSS class `transient` can be used to mark HTML content that should
be removed when the user changes their situation. When a situation
changes, Undum will go back and remove any links from the text
(leaving the text that was in the link). Any HTML content that has the
CSS class `transient` will be completely removed at this time. Undum
uses a fading animation to show the user this is happening, to avoid
the user seeing an abrupt disappearance but being unable to work out
what was removed.

Any HTML tag can be marked as `transient`. It is most commonly used on
a paragraph of text that gives the user a set of options. Undum is
designed to allow game developers to produce beautiful narratives -
you don't want that narrative littered by "You could do X, or you
could do Y." statements. Mark this content as transient, and it will
not form part of the permanent record.

#### `class="sticky"`

When you change situations, links in previous situations will be
removed. This prevents the user backtracking and picking options that
no longer apply. Sometimes you want links to be available for a longer
time, however. In this case mark them with the CSS class
`sticky`. Sticky only applies to links, so should only be added to
`<a>` tags.

#### `class="raw"`

Links can also have the `raw` CSS class. This class prevents Undum
from interpreting the link as an instruction to the game. If you want
to add a link to an external resource, you can add this class to
it. Note that raw links are still removed when you change situations,
so if you want a raw link permanently available, you should also make
it sticky.

For some URLs, Undum can guess that the link is supposed to be an
external link, and will automatically add the `raw` class for
you. This isn't perfect, however, and you are better off not relying
on it. If you have a link that you don't want Undum to capture, always
use the `raw` class.

#### `class="once"`

Although links will be removed when the situation changes, often you
want to remove them before that, as a result of an action within the
current situation. There is an API tool available to do that in your
code.

For convenience, there is also the `once` CSS class. Adding this to a
link means that the link will be removed as soon as it is
clicked. This is mostly useful for action links, because a link that
changes the situation will automatically cause previous links to
disappear.

Note that once is smart about this removal. It removes all links to
the same action, not just the link that was clicked. So if you have
the same action available in two links in your content, both will be
removed.

### Headings

In the default CSS for Undum, the only heading level expected in the
text is `<h1>`. You can use other headings, but you'll have to create
your own CSS styles. One level of heading is almost always enough (if
not too much) for narrative works.


## Types of Link

Undum captures the links you put into your display content, and uses
them to control the flow of the game. There are three formats of link
that Undum understands, plus raw links, which it ignores.

### Situation Links

Situation links are of the form `situation-id`. They must have no
additional punctuation. As we'll see below, situation identifiers
consist of lower case Latin letters, hyphens and the digits 0-9 only.

Clicking a situation link changes the current situation.

### Action Links

Action links are of the form `./action-id`. As for situations, action
identifiers consist of lower case Latin letters, the digits 0-9 and
hyphens only.

Clicking an action link carries out the specified action in the
current situation.

### Combined Links

Combined links are of the form `situation-id/action-id`. They combine
both the previous steps: they change to the given situation, and then
they carry out the given action once there. They are rarely used.

It is possible to use the combined form to refer to an action in the
current situation. Undum is smart enough to understand that it doesn't
need to change situation in that case, so it is entirely equivalent to
the action link. It is rarely used (because it is so much more
verbose), but can be useful. For example, we might want a sticky link
to always take the character into their study and drink a potion,
having this sticky link point to `bedroom/drink-potion`, achieves
this. If they are already in the bedroom, then Undum notices this and
doesn't try to make them enter it again.

### External Links

As described above, you can add any other links to external content in
your display content, as long as you mark it with the `raw` CSS
class. It is also *highly* recommended that you mark all such links as
opening in a new window or tab (add the `target="_blank"` attribute to
the `<a>` tag). If you link the player to another page, and it
replaces the Undum page, then for most browsers, all progress will be
lost. Chrome appears to keep the progress, so that if you hit the back
button you will be where you left off. Other browsers reset the game
to the last saved location, or back to the beginning if the game
hasn't been saved.

### Link Data

*This section describes a feature that is planned, or in development.
It may not be functional in the current version of the code.*

Undum links are allowed to add query data,
e.g. `./action-id?foo=1&bar=2`. This extra data is URL-encoded content
which will be parsed and passed back to your code. For situation links
the data will be passed into the old situation's `exit` handler, and
the new situation's `enter` handler. For action links, the data will
be passed into the situation's `act` handler. For combined links the
data will be passed into both sets of handlers.

Raw links, as usual, do not have any processing performed. If they
contain query data, it will be passed on to their target as it would
for any link in any HTML document.


# File Structure

An Undum game consists of a single HTML file. This imports the game
engine and any supporting files. It also provides the structure needed
for Undum to place content correctly on-screen.

The Undum engine consists of a single Javascript file, `undum.js`. In
order to work, however, it needs supporting files. It requires the
jQuery library (http://jquery.com) to be already imported, and it
requires a game definition file to be imported after it.

The normal pattern of imports in the HTML file is therefore:

    <script type="text/javascript" src="media/js/jquery-1.4.2.min.js"></script>
    <script type="text/javascript" src="media/js/undum.js"></script>
    <script type="text/javascript" src="media/js/mygame.game.js"></script>

By convention, the Javascript files are held in a `media/js`
directory, but this is not enforced, you can arrange these files as
you like, as long as you update the references to match.

In addition to the Javascript files, Undum expects the HTML file that
imports it to have a particular structure. Although there is a good
deal of flexibility, if you need it, you should start with the HTML
file that is provided.

Finally, the HTML file will include a CSS file that controls the look
and feel of the page. There are some elements in the CSS file which
are used by Undum, and so, as for the HTML page, you should start with
the CSS files provided.  In most cases you will be able to leave the
CSS file untouched, or else just tweak colors and image imports to
match your game's style.

## The HTML File

The sample HTML file provided shows the key points to edit. They are:

* The game's title.

* The top-left panel title and summary (you can leave this as an
  explanation of Undum, or change it to be more game-specific).

* The copyright message. Please note that there are two copyright
  lines, the second one is the acknowledgment that your game is based
  on Undum. You must leave the second line unchanged, under the terms
  of use of Undum.

* The path to your game definition file. By convention, game
  definition files are named `yourgamename.game.js`.

## The Game Definition File

The game definition file where you create your game. To define a game
you must provide the following data:

* A unique ID for the game, which is used to make sure saved games
  don't get confused.

* A version number that allows you to manage upgrades to your
  content.

* All the Situations that make up your game.

* The identifier of the situation that starts the game.

In addition it is very common to provide the following data:

* Descriptions of each quality your game will use, and how that should
  be displayed to the player.

* Definitions of what groups of qualities should appear in the
  character panel and what headings to use to label them.

* An Initialization function that sets up the game ready for
  playing. This is where you typically assign any starting qualities
  to the character, or set their initial character text.

And finally, there are a range of other data you can provide:

* Functions to be called whenever any situation is entered, or exited.

* Functions to be called before or after any action is carried out.

### Identifiers

Identifiers are small snippets of text that allow you to refer to
something in Undum. There are two types of identifier. The Game
identifier represents your whole game, and has its own particular
requirements (described below).

Lots of other things in Undum have identifiers (Situations, Actions,
Qualities, Quality Groups), and they all have the same
requirements. These identifiers must consist of Latin lower-case
letters (i.e. a-z, no accents), hyphens, and the digits 0-9 only.

### Game ID

The game identifier should be a string that is unlikely to be used in
other games. You could use a UUID (my preference), or you could use a
variation on your email `mygame-myname@mydomain.com`, or a URL you
control `http://mydomain.com/undum-games/mygame`. If and when Undum
games end up being re-distributable (as I hope they will), having a
universally unique identifier will mean that saved games don't clash.

As stated previously, the game identifier doesn't have the same
requirements as any other identifier in Undum, you can use any
characters to make up your game ID.

### Version Number

The version number is a string of text that indicates what version of
the content is in the file. There is no set format for this version
text, so you can use any scheme that suits you. I have used the
"major.minor" approach.

Like the Game ID, this value is used to make sure that saved games
don't clash. If you change you content, then previous saved games may
not work correctly. By updating the version number, you allow the
player to be notified of this directly, rather than suffering a
silent crash. The effect of this is that you don't need to update the
version number if you make a change to something that doesn't alter
the structure of the game. If you just change some text, for example,
or add an extra action that merely outputs a piece of description.

### Situation List

Situations are defined in a Javascript object, placed in the
`undum.game.situations` property. Situations in the object use their
situation identifier as a property name, and a `Situation` object as
its value.  For example:

    undum.game.situations = {
        doorway: new Situation(...),
        lobby: new SimpleSituation(...),
        lobby-upstairs-closed: new MyCustomSituation(...),
        ... etc ...
    };

The situation objects are described more fully below.

### Starting Situation

This is placed in the `undum.game.start` property. It should consist
of the situation identifier as a string. It must be given.

### Qualities

Qualities don't have to be displayed to the user. They can just
function as internal properties for use by your code. Qualities that
will never be displayed don't need to be declared, you can just set
them when you need them (we'll look at the API for setting qualities
below).

Often you want the quality to be displayed, however, and so you need
to tell Undum to display the quality, and how it should be
formatted. The `QualityDefinition` object does that. Any quality that
doesn't have a corresponding quality definition will be invisible to
the player.

Quality definitions are placed in an object in the
`undum.game.qualities` property. Within this object, the property
names are the quality identifiers, and the values they contain are
`QualityDefinition` objects. For example:

    undum.game.qualities = {
        investigation: new IntegerQuality("Investigation", ...),
        "found-mr-black": new OnOffQuality("Found Mr. Black", ...),
        ... etc ...
    };

There are a number of `QualityDefinition` constructors defined which
automatically format in common ways, you can also define your own and
take complete control of the output. We'll return to discussion of the
API, below.

### Quality Groups

Qualities can be assigned to groups, and displayed under a common
heading in the character panel. To define groups, place an object in
the `undum.game.qualityGroups` property. This object should have
properties which are the group identifiers, and values that are
`QualityGroup` objects.  For example:

    undum.game.qualityGroups = {
        stats: new QualityGroup(...),
        clues: new QualityGroup(...),
        equipment: new QualityGroup(...)
    }

A common source of puzzlement is that you don't use this data
structure to define which qualities belong in which group. Instead,
each quality that you want to assign to a group, should be given the
identifier of the group it belongs to. So your `undum.game.qualities`
property will look something like:

    undum.game.qualities = {
        investigation: new IntegerQuality("Investigation", {group:'stats'}),
        "found-mr-black": new OnOffQuality("Found Mr. Black", {group:'clues'}),
        ... etc ...
    };

Again, see the API documentation below for more details about what you
can pass into these constructors.

### Initialization Function

Your initialization function should be placed in the `undum.game.init`
property. Normally its job is to configure the character at the start
of the game. For example:

    undum.game.init = function(character, system) {
        character.qualities.investigating = 0;
        character.qualities.money = 100;
        ... etc ...
        system.setCharacterText(...);
    };

Initialization functions can, but normally doesn't, output
text. Instead the starting situation is tasked with outputting the
initial content.

### Global Event Functions

Most of the time you want Situations to handle user
interaction. Occasionally, however, you have to handle something that
spans situations. It would be inconvenient to duplicate the same code
in every situation. So Undum provides a set of hooks for you to
respond globally to user interaction. There are four of these:
`enter`, `exit`, `beforeAction` and `afterAction`. You can define
functions in your game file using the properties: `undum.game.enter`,
`undum.game.exit`, `undum.game.beforeAction`, and
`undum.game.afterAction`.

The `enter` and `exit` functions look like this:

    undum.game.enter = function(character, system, from, to) {
        ...
    };

where `from` and `to` are the identifiers of the situations being left
and entered, respectively. And the `beforeAction` and `afterAction`
functions look like this:

    undum.game.beforeAction = function(character, system, situation, action) {
        ...
    };

where `situation` is the current situation identifier, and `action` is
the identifier of the action being carried out.

These functions intentionally look like the `enter`, `exit` and `act`
methods of the `Situation` object. These are described in more detail
in the API reference, below.

# API Reference

This section describes the types of object available to your game
code.

## `Character`

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

## `System`

The system represents the interface between your code and the
user-interface.  You don't create your own `System` object, it is
passed into your code.

#### `write(content)`

Writes new content to the main flow of the story. The content you pass
in must be either valid DOM elements already, or else be a string
containing text in Display Content format.

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

`from`: The proportion along the progress bar where the animation
    starts. Defaults to 0, valid range is 0-1.

`to`: The proportion along the progress bar where the animation
    ends. Defaults to 1, valid range is 0-1.

`showValue`: If `true` (the default) then the new value of the quality is
    displayed above the progress bar.

`displayValue`: If this is given, and `showValue` is `true`, then the
    given value is used above the progress bar. If this isn't given,
    and `showValue` is `true`, then the display value will be
    calculated from the `QualityDefinition`, as normal. This option is
    useful for qualities that don't have a definition, because they
    don't normally appear in the UI.

`title`: The title of the progress bar. If this is not given, then the
    title of the quality is used. As for `displayValue` this is
    primarily used when the progress bar doesn't have a
    `QualityDefinition`, and therefore doesn't have a title.

`leftLabel`, `rightLabel`: Underneath the progress bar you can place
    two labels at the left and right extent of the track. These can
    help to give scale to the bar. So if the bar signifies going from
    10.2 to 10.5, you might label the left and right extents with "10"
    and "11" respectively and have the `from` and `to` value be 0.2
    and 0.5 respectively. If these are not given, then the labels will
    be omitted.

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

### `Random`

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

## `Situation`

The `Situation` object is the prototype of all the situations in your
game. It can be used directly, or through its more common derived
type, `SimpleSituation`. The base `Situation` gives you maximum
flexibility, but `SimpleSituation` provides more functionality and can
produce terser code.

#### `new Situation(options)`

Creates a new situation. The options array can specify your
implementation of any or all of the three functions that control the
behavior of a situation: i.e. `enter`, `act`, or `exit`. This allows
you to easily create situations that override certain behaviors with
code such as:

    Situation({
        enter: function(character, system, from) {
            ... your implementation ...
        }
    });

See below for information on `enter`, `exit` and `act`.

Note that the methods defined in the `Situation` object are never
called by your code. They are methods that you implement so that Undum
can call them to respond to user interaction.

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

### SimpleSituation

This prototype builds on the basic `Situation`, providing tools to
make it easy to output content in the `enter` method, and to switch
between different functions depending on the action identifier passed
into the `act` method. The `exit` method of `SimpleSituation` is
exactly as for the base type `Situation`.

#### `new SimpleSituation(content, options)`

Creates a new simple situation that will display the given content
when its `enter` method is called. The given options array provides
further control of the behavior of this type. Valid options are:

`enter`: Providing an enter function in the `options` parameter allows
    you to add additional behavior to the enter method. Your custom
    function will be called *in addition to* and *after* the default
    content is written to the screen. You cannot override
    `SimpleSituation`'s `enter` method by providing this function. To
    override the method, you would have to create a derived type. If
    you provide an `enter` function, it should have the same form as
    `Situation.enter`.

`act`: Pass in a function to add additional behavior to the act
    method. As for `enter`, your method is called *in addition to* and
    *after* the built-in functionality.

`exit`: Because `SimpleSituation` has no default behavior for `exit`,
    any function you pass in here will be the only exit behavior for
    the object you are creating.

`heading`: The `content` that you specify will be written out
    verbatim.  You can include headings in this content. Often it is
    more convenient to pass in just the text in the `content`
    parameter. In that case you may define this `heading` parameter to
    display a heading before the text. Unlike `content`, this doesn't
    need to conform to the Display Content requirements.

`actions`: This should be an object that maps action identifiers to
    responses. A response should be either some Display Content to
    write to the screen, or a function that will process that
    request. These functions should have the same signature as the
    `Situation.act` method. Each function will only be called if the
    situation receives a call to `act` with its corresponding
    identifier. This allows you to simply define functions that only
    get called when particular actions happen.

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

## QualityDefinition

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

priority: A string used to sort qualities within their groups. When
    the system displays a list of qualities they will be sorted by
    this string. If you don't give a priority, then the title will be
    used, so you'll get alphabetic order. Normally you either don't
    give a priority, or else use a priority string containing 0-padded
    numbers (e.g. "00001").

group: The identifier of a group in which to display this
    parameter. If a group is given, then it must be defined in your
    `undum.game.qualityGroups` property.

extraClasses: These classes will be attached to the `<div>` tag that
    surrounds the quality when it is displayed. A common use for this
    is to add icons representing the quality. In your CSS define a
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

### `IntegerQuality`

This is a derived type of `QualityDefinition` that displays the
quality value by rounding it down to the nearest integer. This is
ideal for most numeric statistics.

### `NonZeroIntegerQuality`

This is a derived type of `IntegerQuality` that only displays its
value when it is non-zero. If it is non-zero then it formats in the
same way as `IntegerQuality`. Whereas `IntegerQuality` whould show
zero values as '0', this type of quality displays nothing.

### `NumericQuality`

This is a derived type of `QualityDefinition` that displays the
quality value directly, as a full floating point value.

### `WordScaleQuality`

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

offset: With offset=0 (the default), a quantity value of 0 will map to
    the first word, and so on. If offset is non-zero then the value
    given will correspond to the first word in the list. So if
    offset=4, then the first word in the list will be used for
    value=4, the second for value=5. You can specify a non-integer
    offset value, in this case the offset is applied *before* the
    value is rounded down.

useBonuses: If this is true (the default), then values outside the
    range of words will be constructed from the word and a numeric
    bonus. So with offset=0 and five words, the last of which is
    'amazing', a score of six would give 'amazing+1'.  if this is
    false, then the bonus would be omitted, so anything beyond
    'amazing' is still 'amazing'.

### `FudgeAdjectivesQuality`

This is a derived type of `WordScaleQuality` that doesn't require you
to specify the words you wish to use. It uses the word scale from the
Fudge RPG: "terrible", "poor", "mediocre", "fair", "good", "great" and
"superb".

#### `new FudgeAdjectivesQuality(title, options)`

The parameters `title` and `options` are as for the `WordScaleQuality`
constructor. The `offset` option defaults to -3, however (in
`WordScaleQuality` it defaults to 0), making "fair" the display value
for 0.

### `OnOffQuality`

An `OnOffQuality` returns `null` from its `format` method
(i.e. removes itself from the character panel) when the corresponding
quality value is zero. Otherwise it returns the empty string (i.e. it
is shown in the panel, but doesn't have a value label). See
`QualityDisplay.format` above for more details on this distinction.

#### `new OnOffQuality(title, options)`

The constructor for this type is the same as for `QualityDefinition`
from which it is derived. It accepts one extra option:

`onDisplay`: If given, then rather than displaying the empty string,
    it displays the given string when its corresponding value is
    non-zero. This can be used to display a check-mark, for example
    (`{onDisplay:"&#10003;"}`), or even a HTML `img` tag.

### YesNoQuality

A `YesNoQuality` displays one of two strings depending whether its
value is zero or not.

#### `new YesNoQuality(title, options)`

The constructor for this type is the same as for `QualityDefinition`
from which it is derived. It accepts two extra options:

`yesDisplay`, `noDisplay`: Either or both of these may be given. If
    they are given, then they should be set to a string, which will be
    used to indicate non-zero or zero values, respectively. By default
    "yes" and "no" are used.

## `QualityGroup`

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

`priority`: A string used to sort quality groups. When the system
    displays more than one quality group, they will be sorted by this
    string. If you don't give a priority, then the title will be used,
    so you'll get alphabetic order. Normally you either don't give a
    priority, or else use a priority string containing 0-padded
    numbers (e.g. "00001").

extraClasses: These classes will be attached to the `<div>` tag that
    surrounds the entire quality group when it is displayed. You can
    use this in addition to your CSS to radically change the way
    certain qualities are displayed.


# Loading and Saving

There is no API for you to manually access loading and saving
functionality. The load and save functions are triggered by the
buttons on the user interface. But the way loading and saving work
does have a big impact on the way you write your code.

Undum makes a big feature of the fact that you can scroll back through
the story you've helped create. To save your character's progress you
would have to save not only the current situation and the character's
qualities, but also all the text that has been generated up to that
point. This would not be a problem in a downloaded game, because your
hard-drive is plenty big enough. Unfortunately in a browser game,
there is a limit on how much data you can store. Worse, this data
limit is per-domain. So if you hosted 10 Undum games on a server, the
saved games from all ten would have to fit into the limited
space. This makes it impractical to save the complete text history.

Instead Undum saves all the actions you've taken as a player. It
doesn't save the character's qualities or any other information, just
the actions. It expects to be able to rebuild the complete text, and
the complete current state of the character, by playing back these
actions when the file is loaded. We call this determinism, because the
current state of the character and the content needs to be determined
from just the actions they take.

This means that you must take care to write all your code in a way
that will generate *exactly* the same results if the game was played
again in the same way.

There are two major limitations to this, firstly it means you can't
use random events, and secondly you can't use timed events. Both of
these are such serious limitations that Undum provides ways around
them.

Undum provides your code with a random number generator in
`System.rng`, which is an object with the prototype `Random`. This
random number generator works with the loading and saving code to make
sure that, when you load a saved game, the exact same random number
requests will produce the exact same result. This means you get all
the benefits of randomness (i.e. two separate games may have different
results for the same action), but we can always replay a game
exactly. Dealing with random actions is a difficult issue in testing
any interactive fiction game. This approach solves that problem. You
should, therefore, *never* use Javascript's built-in random number
generate (`Math.random`), only ever use the one provided by Undum.

Finally, Undum also provides your code timing information in
`System.time`, which is the number of seconds (and fractional seconds)
elapsed since the player began the game. You can use this timing
information to implement puzzles in your game (such as asking the
player to complete a series of tasks in a specified amount of
time). This timing system coordinates with the loading and saving
system to make sure that, when you save and load the game, the timing
picks up where it left off. Feel free to make decisions in your code
based on the current value of `System.time`, but never use
Javascript's `Date` object.

If you do not follow these restrictions, then it is likely that saved
games will not load correctly. A player may save their game at one
point and find most of their progress wiped out when they load it
again.


# Translation and Internationalization

Undum provides support for translations and internationalization.
In particular, if you feel you want to translate Undum, then a lot
of work has already been done for you. I am very grateful to Oreolek
for this assistance. He translated the Russian version within days
of the code being released, and advised on the tools that would
make translation easier.

To write a game in another language, you need only to write the game
content in that language. The identifiers you use in the game (to
represent situations, actions, qualities and quality groups) must use
only unaccented lower case latin letters and numbers, but the text you
generate can contain any content you choose. Including right to left
content or ideographs.

Undum itself has a small number of error messages and pieces of text
that it uses. These include the default names for the
FudgeAdjectivesQuality values. These strings are all found at the end
of the `undum.js` file. They can be overridden. Simply define a new
language file for your language (e.g. `lang/gk.js`) and override the
appropriate strings. In your HTML file, after importing `undum.js`,
import you strings file. For example, the end of the Russian
translation of the tutorial (`tutorial.ru.html`) has:

    <script type="text/javascript" src="media/js/undum.js"></script>
    <script type="text/javascript" src="media/js/lang/ru.js"></script>

These translation strings are given as an object mapping the string
name to the translated strings. This object is given as part of the
`undum.translation` object, with a property name equal to the language
name. So, for example, the UK English translation might begin:

    undum.lanuage["en-UK"] = {
        no_group_definition: "Couldn't find a group definition for {id}.",

Within the translation strings, data to be incorporated later is given
in curly braces.


## Language Codes

Undum uses a simplified version of the IETF standards for language
code. For our purposes this consists of three parts, only the first of
which is required: `language-Script-REGION` where `language` is a two
letter lower-case ISO language code, `Script` is a four letter
title-case script identifier, and `REGION` is a two letter country or
region code, all capitalized. The script is omitted when it is the
default script for a language and locale. You would specify a script
if you were using romaji (Latin letters) to write Japanese, but not if
you were writing it in Kanji and kana.

The major virtue of this standard is that it allows fall through when
a translation is not available. For example a translation into
Brazillian Portuguese `pt-BR` might be different to one into Angolan
Portuguese `pt-AO`, but there may be some strings they have in
common. This allows a translator to create a base file for just plain
Portuguese `pt`, then each country's dialect can define its own file
that just overrides a few of the strings.


## Filename Conventions

It is only a convention, but for all files that occur in language
specific versions, I have used the filename convention of placing the
language code before the extension, e.g. `filename.lang.extension`. The
game file is similar `filename.game.lang.js`. You are free to use any
format you choose, of course, but if you want to contribute back to
the trunk, please follow this convention, to save having to rename
things and connect up the links later.


## API

The translation system provides a simple API based on the `Globalite`
package of Nicolas Merouze (the implementation is unique to Undum). It
adds a `l()` method to the Javascript `String` prototype. This method
has the signature `l(data)`, where data can be any object mapping
strings to other strings.

The method attempts to figure out what the current language is by
looking at the `lang` attribute of the top level HTML tag (you'll
notice in the tutorial games this is defined in all cases, you should
do the same). It then tries to find a matching object containing
translations in `undum.language`. If it finds such an object, then it
looks up the original string in that object to find a translation. It
then merges any data passed into the `l` method into the string,
before returning the result.

The translation look-up honors the IETF rules for language fallback,
so (continuing the previous example) if your game file is in Brazilian
Portuguese `pt-BR`, and a translation isn't found, then generic
Portuguese translation `pt` is also checked. Finally, if no valid
translation is found, then the default version is used. Since Undum
was written in English, this default version is the English
version. This is purely by my convenience, and isn't part of the IETF
spec!
