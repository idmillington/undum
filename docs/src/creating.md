# Creating an Undum Game

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

* The copyright message. Please note that there is also a message
  that acknowledges your game is based on Undum. You can remove this
  entirely, but if you do leave it in place, that helps people
  find the software and perhaps write their own game.

* The path to your game definition file. By convention, game
  definition files are named `yourgamename.game.js`.

In addition, from v.2 onwards, Undum supports defining Situations
entirely within HTML. These situations are scanned and added to
Situations defined in your Javascript Game Definition file, allowing
you to have the best of both worlds. HTML Situations are discussed in
the page on the <a href="./HTML.html">HTML API</a>.


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
respond globally to user interaction. There are five of these:
`enter`, `afterEnter`, `exit`, `beforeAction` and `afterAction`. You 
can define functions in your game file using the properties: 
`undum.game.enter`, `undum.game.afterEnter`,
`undum.game.exit`, `undum.game.beforeAction`, and
`undum.game.afterAction`.

The `enter`, `afterEnter`, and `exit` functions look like this:

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
in the API reference.
