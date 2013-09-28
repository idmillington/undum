# HTML API

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

#### `class="options"`

The options class only works on an unordered list. The default CSS
also styles this differently. The list items will be presented as
options within a table of choices. On devices with a mouse or pointer,
the rows will change color when they are hovered over. The player can
click anywhere on the row and the first link that it contains will be
executed.

This class is intended for smarter presentation of standard option
blocks, if you don't want your choices to be embedded into the
hypertext.

Note that if you use this style, the unordered list will automatically
disappear after being clicked, regardless of whether it is marked as
"`transient`".

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


# Defining Situations in HTML

*New in Version 2*

From v.2, Undum supports defining situations entirely from HTML. The
tutorial game files show this in action, if you want to see a concrete
example.

### Required Data

Situations defined in HTML should be diven as a `div` with
`class="situation"` set. The content of the `div` will be turned into
a new `SimpleSituation` (see the <a href="./API.html">API
document</a>), with the content of the div output when the situation's
`enter` method is called. In addition to the `class="situation"` and
the HTML content, the `div` also requires its `id` attribute to be
set, and the value of this id will be used as the situation id for the
newly created situation. Situations created from HTML are instances of
the `SimpleSituation` prototype.

The game scans the HTML file for situations, compiles them and adds
them to the main `game.situation` dictionary. Because the situations
end up in the same place, you can freely mix the two methods, defining
some situations in HTML, and others in Javascript. For this reason,
you can't have a situation defined in the HTML with the same id as one
in your Javascript file. This will raise an error.

### Optional Data

In addition to the id and content of the situation, additional options
can be set by defining one or more of the following `data-` attributes
on the `div`. Each is interpreted and passed to a corresponding option
on a `SimpleSituation` object, so to find more information on what
each value means, see the <a href="./API.html">Javascript API</a>.

#### data-option-text

If defined, this specifies the label that will be used when the
situation appears in an choice block. In Javascript, this can be
either fixed text, or a function. In the HTML API, only fixed text is
supported.

#### data-can-view

If defined, this should be the body of a function that will be
compiled and attached to the situation's canView method. The
content of this attribute will be wrapped with:

    (function(character, system, situation) {
    ... HTML attribute ...
    })

to make the final function. So, your definition should end with a
`return` statement. For example:

    <div id="situation-id-1" class="situation"
     data-can-view="return character.qualities.foo == 2">

This is intended to be similar to the way browsers function with event
handlers on HTML tags, such as `onClick`. The actual semantics are
difficult to replicate exactly, and there may be use-cases that are
impossible, but for most uses, this will do the right thing.

#### data-can-choose

If defined, this should be the body of a function that will be
compiled and attached to the situations canChoose method. See the
description of `canView`, above, for details of how the value in this
attribute is interpreted.

#### data-priority

If given, this is parsed as a number and set as the situation's
`priority` value.

#### data-frequency

If given, this is parsed as a number and set as the situation's
`frequency` value.

#### data-display-order

If given, this is parsed as a number and set as the situation's
`displayOrder` value.

#### data-tags

If given this should be a set of tags to label the situation with. The
string is split at commas, spaces and tabs. So "foo, bar cube
dock-trog" is parsed as four tags: "foo", "bar", "cube" and
"dock-trog".

#### data-heading

If given, then this heading will be used as the `heading` property for
the SimpleSituation. If no `data-option-text` is given, the heading
will also be used in choice blocks.

#### data-choices

If given, this should be a list of items to use in generating an
implicit set of situation choices, exactly as for the `choices`
property of `SimpleSituation`. The values of this list is parsed
exactly as for `data-tags`, above, splitting at commas, spaces and
tags.

#### data-min-choices

If `data-choices` is given, this value can also be specified. If so,
it is interpreted as an integer and passed to the `minChoices` option
of `SimpleSituation`.


#### data-max-choices

If `data-choices` is given, this value can also be specified. If so,
it is interpreted as an integer and passed to the `maxChoices` option
of `SimpleSituation`.