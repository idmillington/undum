# Undum Reference Documentation

# High Level Overview

Undum games area based around three concepts: Situations, Actions and 
Qualities.

## Situations

A situation is 
a chunk of code that is responsible for adding content to the screen and 
responding to user interaction. All user interaction is performed by clicking
links in the content.

Often a link will change the current situation, in which case another 
situation is loaded, can write to the screen, and can begin responding to user 
interaction. When a situation changes, all links that were previously available
are removed, so that the player can't unfairly go back and try alternative 
options after committing to one. It is possible to override this behavior,
see the section on 'Sticky', below.

There is always exactly one active situation. These situations, and the 
links between them, form the structure of the game.

## Actions

A situation may offer the player a series of actions to perform. These actions
are internal to that situation and normally do not cause the situation to 
change. Actions may output more content, including new links for the user
to select.

## Qualities

Qualities represent the current state of the character. Internally they are
all numeric values, able to take on any decimal value, positive or negative.
They have no meaning to Undum - they are given meaning by your code as you
perform calculations or make decisions based on their value.

Qualities display themselves to the user through a formatting function, which
can turn the number into any kind of indicator: a progress bar, a symbol,
a word, an integer, and so on. So as far as the user is concerned, qualities
can represent any kind of value.

## Other Concepts

There are a handful of other elements to an Undum game, but they are very 
much in a supporting role. Quality groups allow you to display a set of 
qualities under a common heading; and character text is a short chunk of HTML
that you can use to summarize a character's qualities, or to give hints.


# HTML

All of Undum's output is HTML. This allows you to style your content in any 
way you choose. It also allows you to include rich media into your output,
such as images, video or audio. 

## Display Content

All HTML output should be in a format we
call "Display Content" - this has particular rules:

* Display Content must always start and end with a HTML tag. It may consist 
  of more than one tag internally, however. So we can have the structure: 
  `<p>...</p><img>`, for example, but not `some text...<img>`.
  
* It must be a complete snippet of HTML in its own right. So any tags that 
  represent a range of content must have their closing tags present. So we
  can do `<p><em>...</em></p>`, but not `<p><em>...</p>`.

## CSS Styles

Undum also uses some of HTML's capabilities to control its own behavior. In
particular, it uses a series of CSS classes to control how content behaves.

### Transient

The CSS class `transient` can be used to mark HTML content that should be 
removed when the user changes their situation. When a situation changes, Undum
will go back and remove any links from the text (leaving the text that was
in the link). Any HTML content that has the CSS class `transient` will
be completely removed at this time. Undum uses a fading animation to show
the user this is happening, to avoid the user seeing an abrupt disappearance
but being unable to work out what was removed.

Any HTML tag can be marked as `transient`. It is most commonly used on a 
paragraph of text that gives the user a set of options. Undum is designed
to allow game developers to produce beautiful narratives - you don't want that
narrative littered by "You could do X, or you could do Y." statements. Mark
this content as transient, and it will not form part of the permanent record.

### Sticky

When you change situations, links in previous situations will be removed.
This prevents the user backtracking and picking options that no longer apply.
Sometimes you want links to be available for a longer time, however. In this
case mark them with the CSS class `sticky`. Sticky only applies to links, so
should only be added to `<a>` tags.
  
### Raw

Links can also have the `raw` CSS class. This class prevents Undum from
interpreting the link as an instruction to the game. If you want to add 
a link to an external resource, you can add this class to it. Note that
raw links are still removed when you change situations, so if you want 
a raw link permanently available, you should also make it sticky.

For some URLs, Undum can guess that the link is supposed to be an external
link, and will automatically add the `raw` class for you. This isn't perfect,
however, and you are better off not relying on it. If you have a link that
you don't want Undum to capture, always use the `raw` class.

### Once

Although links will be removed when the situation changes, often you want
to remove them before that, as a result of an action within the current
situation. There is an API tool available to do that in your code. 

For convenience, there is also the `once` CSS class. Adding this to a link
means that the link will be removed as soon as it is clicked. This is mostly
useful for action links, because a link that changes the situation will
automatically cause previous links to disappear.

Note that once is smart about this removal. It removes all links to the same
action, not just the link that was clicked. So if you have the same action
available in two links in your content, both will be removed.

### Headings

In the default CSS for Undum, the only heading level expected in the text is
`<h1>`. You can use other headings, but you'll have to create your own CSS
styles. One level of heading is almost always enough (if not too much) for 
narrative works.


## Types of Link

Undum captures the links you put into your display content, and uses them to
control the flow of the game. There are three formats of link that Undum
understands, plus raw links, which it ignores.

### Situation Links 

Situation links are of the form `situation-id`. They must have no additional
punctuation. As we'll see below, situation identifiers consist of lower case
latin letters, hyphens and the digits 0-9 only.

Clicking a situation link changes the current situation.

### Action Links

Action links are of the form `./action-id`. As for situations, action 
identifiers consist of lower case latin letters, the digits 0-9 and hyphens
only. 

Clicking an action link carries out the specified action in the current 
situation.

### Combined Links

Combined links are of the form `situation-id/action-id`. They combine
both the previous steps: they change to the given situation, and then they
carry out the given action once there. They are rarely used.

It is possible to use the combined form to refer to an action in the current
situation. Undum is smart enough to understand that it doesn't need to change
situation in that case, so it is entirely equivalent to the action link. It
is rarely used (because it is so much more verbose), but can be useful. For 
example, we might want a sticky link to always take the character into their
study and drink a potion, having this sticky link point to 
`bedroom/drink-potion`, achieves this. If they are already in the bedroom,
then Undum notices this and doesn't try to make them enter it again.

### External Links

As described above, you can add any other
links to external content in your display content, as long as you mark it
with the `raw` CSS class. It is also *highly* recommended that you mark
all such links as opening in a new window or tab (add the `target="_blank"`
attribute to the `<a>` tag). If you link the player to another page, and
it replaces the Undum page, then for most browsers, all progress will be
lost. Chrome appears to keep the progress, so that if you hit the back button
you will be where you left off. Other browsers reset the game to the last
saved location, or back to the beginning if the game hasn't been saved.

### Link Data

*This section describes a feature that is planned, or in development. 
It may not be functional in the current version of the code.*

Unum links are allowed to add query data, e.g. `./action-id?foo=1&bar=2`. This
extra data is URL-encoded content which will be parsed and passed back to your
code. For situation links the data will be passed into the old situation's 
`exit` handler, and the new situation's `enter` handler. For action links,
the data will be passed into the situation's `act` handler. For combined
links the data will be passed into both sets of handlers. 

Raw links, as usual, do not have any processing performed. If they contain 
query data, it will be passed on to their target as it would for any link in 
any HTML document.


# File Structure

An Undum game consists of a single HTML file. This imports the game engine
and any supporting files. It also provides the structure needed for Undum to
place content correctly on-screen.

The Undum engine consists of a single Javascript file, `undum.js`. In order to 
work, however, it needs supporting files. It requires the jQuery library
(http://jquery.com) to be already imported, and it requires a game definition
file to be imported after it.

The normal pattern of imports in the HTML file is therefore:

    <script type="text/javascript" src="media/js/jquery-1.4.2.min.js"></script>
    <script type="text/javascript" src="media/js/undum.js"></script>
    <script type="text/javascript" src="media/js/mygame.game.js"></script>
    
By convention, the Javascript files are held in a `media/js` directory, but
this is not enforced, you can arrange these files as you like, as long as
you update the references to match.

In addition to the Javascript files, Undum expects the HTML file that imports
it to have a particular structure. Although there is a good deal of 
flexibiltiy, if you need it, you should start with the HTML file that
is provided.

Finally, the HTML file will include a CSS file that controls the look and feel
of the page. There are some elements in the CSS file which are used by Undum,
and so, as for the HTML page, you should start with the CSS files provided.
In most cases you will be able to leave the CSS file untouched, or else just
tweak colors and image imports to match your game's style.

## The HTML File

The sample HTML file provided shows the key points to edit. They are:

* The game's title.

* The top-left panel title and summary (you can leave this as an explanation
  of Undum, or change it to be more game-specific).

* The copyright message. Please note that there are two copyright lines, the
  second one is the acknowledgement that your game is based on Undum. You must
  leave the second line unchanged, under the terms of use of Undum.

* The path to your game definition file. By convention, game definition files
  are named `yourgamename.game.js`.

## The Game Definition File

The game definition file where you create your game. To define a game you 
must provide the following data:

* A unique ID for the game, which is used to make sure saved games don't get
  confused.

* All the Situations that make up your game.

* The identifier of the situation that starts the game.

In addition it is very common to provide the following data:

* Descriptions of each quality your game will use, and how that should be 
  displayed to the player.
  
* Definitions of what groups of qualities should appear in the character panel
  and what headings to use to label them.
  
* An Initialization function that sets up the game ready for playing. This is
  where you typically assign any starting qualities to the character, or 
  set their initial character text.
  
And finally, there are a range of other data you can provide:

* Functions to be called whenever any situation is entered, or exited.

* Functions to be called before or after any action is carried out.

### Identifiers

Identifiers are small snippets of text that allow you to refer to something in 
Undum. There are two types of identifier. The Game identifier represents
your whole game, and has its own particular requirements (described below).

Lots of other things in Undum have identifiers (Situations, Actions, Qualities,
Quality Groups), and they all have the same requirements. These identifiers
must consist of latin lower-case letters (i.e. a-z, no accents), hyphens, and
the digits 0-9 only.

### Game ID

The game identifier should be a string that is unlikely to be used in other
games. You could use a UUID (my preference), or you could use a variation on 
your email `mygame-myname@mydomain.com`, or a URL you control 
`http://mydomain.com/undum-games/mygame`. If and when Undum games end up
being re-distributable (as I hope they will), having a universally unique
identifier will mean that saved games don't clash.

As stated previously, the game identifier doesn't have the same requirements
as any other identifier in Undum, you can use any characters to make up your
game ID.

### Situation List

Situations are defined in a Javascript object, placed in the 
`undum.game.situations` property. Situations in the object use their
situation identifier as a property name, and a `Situation` object as its value.
For example:

    undum.game.situations = {
        doorway: new Situation(...),
        lobby: new SimpleSituation(...),
        lobby-upstairs-closed: new MyCustomSituation(...),
        ... etc ...
    };

The situation objects are described more fully below.

### Starting Situation

This is placed in the `undum.game.start` property. It should consist of the
situation identifier as a string. It must be given.

### Qualities

Qualities don't have to be displayed to the user. They can just function as
internal properties for use by your code. Qualities that will never be 
displayed don't need to be declared, you can just set them when you need
them (we'll look at the API for setting qualities below).

Often you want the quality to be
displayed, however, and so you need to tell Undum to display the quality, and
how it should be formatted. The `QualityDefinition` object does that. Any 
quality that doesn't have a corresponding quality definition will be invisible 
to the player.

Quality definitions are placed in an object in the `undum.game.qualities`
property. Within this object, the property names are the quality identifiers, 
and the values they contain are `QualityDefinition` objects. For example:

    undum.game.qualities = {
        investigation: new IntegerQuality("Investigation", ...),
        "found-mr-black": new OnOffQuality("Found Mr. Black", ...),
        ... etc ...
    };
    
There are a number of `QualityDefinition` constructors defined which
automatically format in common ways, you can also define your own and take
complete control of the output. We'll return to discussion of the API, below.

### Quality Groups

Qualities can be assigned to groups, and displayed under a common heading
in the character panel. To define groups, place an object in the 
`undum.game.qualityGroups` property. This object should have properties 
which are the group identifiers, and values that are `QualityGroup` objects. 
For example:

    undum.game.qualityGroups = {
        stats: new QualityGroup(...),
        clues: new QualityGroup(...),
        equipment: new QualityGroup(...)
    }

A common source of puzzlement is that you don't use this data structure to
define which qualities belong in which group. Instead, each quality that
you want to assign to a group, should be given the identifier of the group
it belongs to. So your `undum.game.qualities` property will look something
like:

    undum.game.qualities = {
        investigation: new IntegerQuality("Investigation", {group:'stats'}),
        "found-mr-black": new OnOffQuality("Found Mr. Black", {group:'clues'}),
        ... etc ...
    };

Again, see the API documentation below for more details about what you can
pass into these constructors.

### Initialization Function

Your initialization function should be placed in the `undum.game.init` 
property. Normally its job is to configure the character at the start of
the game. For example:

  undum.game.init = function(character, system) {
      character.qualities.investigating = 0;
      character.qualities.money = 100;
      ... etc ...
      system.setCharacterText(...);
  }; 

Initialization functions can, but normally doesn't, output text. Instead the 
starting situation is tasked with outputting the initial content.

### Global Event Functions

Most of the time you want Situations to handle user interaction. Occasionally,
however, you have to handle something that spans situations. It would be 
inconvenient to duplicate the same code in every situation. So Undum provides
a set of hooks for you to respond globally to user interaction. There are
four of these: `enter`, `exit`, `beforeAction` and `afterAction`. You can
define functions in your game file using the properties: `undum.game.enter`,
`undum.game.exit`, `undum.game.beforeAction`, and `undum.game.afterAction`.

The `enter` and `exit` functions look like this:

    undum.game.enter = function(character, system, from, to) {
        ...
    };
    
where `from` and `to` are the identifiers of the situations being left
and entered, respectively. And the `beforeAction` and `afterAction` functions
look like this:

    undum.game.beforeAction = function(character, system, situation, action) {
        ...
    };
    
where `situation` is the current situation identifier, and `action` is the 
identifier of the action being carried out.

These functions intentionally look like the `enter`, `exit` and `act` methods 
of the `Situation` object. These are described in more detail in the API 
reference, below.

# API Reference

This section describes the types of object available to your game code.

## Character

The character is created for you, but is passed into most of the functions
that you define. It consists of an object with no methods and two properties:

#### `qualities`

The qualities object maps quality identifiers to their current value. Your
code finds the current value associated with a quality by reading from 
this object, for example:

    var gold = character.qualities.gold;
    
To set a quality, you have two choices. If you know the quality you want to
set will not appear in the user interface, then you can set it directly:

    character.qualities.gold += 1;
    
If it does appear on-screen, then this approach will mean that the character
panel doesn't update, and the screen will be out of synch with the actual
value. Instead it is better to use the `System` method `setQuality`, which
also updates the UI:

    system.setQuality('gold', character.qualities.gold+1);
    
It is fine to use `setQuality` if the quality isn't 
visible, making this the preferred option for all quality modifications.

#### `sandbox`

Not every bit of data you want to associate with a character fits nicely
into a quality. The sandbox is a general storage space for any further 
data you want to store in the course of your game, for example:

    character.sandbox.roomsSearched.push('bathroom');
    
Sandbox data is never visible to the user, so you can use any data structures
you like here, to any depth.

## System

The system represents the interface between your code and the user-interface.
You don't create your own `System` object, it is passed into your code.

#### `write`

#### `rnd`

This holds a general purpose random number generator. It is an object derived
from the `Random` prototype, so see `Random` below for details on its API.

#### `setQuality`

#### `animateQuality`

####

### Random

## Situation

### SimpleSituation

## QualityDefinition

### IntegerQuality

### NumericQuality

### WordScaleQuality

### FudgeAdjectivesQuality

### OnOffQuality

### YesNoQuality

## QualityGroup


    
    
    
    
    
    
    
    
    
    