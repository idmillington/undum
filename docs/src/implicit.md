# New Choice System

# New Choice System

*New in Version 2*

In version one of Undum, all links from one situation to another had
to be created manually using HTML. If you wanted a set of choices to
offer, you had to create the links yourself, put them in the
appropriate HTML container. If you wanted those choices to depend on
the current state of the game (say, a choice to look behind a secret
panel that was only visible when the panel was discovered), you had to
code that logic yourself in HTML. This meant that, in practice, most
Undum games were simpler, and rarely used branches that depended on
context.

In version 2 both of these issues were addressed: the ability to
quickly build the links to new situations in the standard HTML format
(using the `System.writeChoices` method), and the ability to generate
a list of situations that are available, given the current state of
the game.

# Generating Choice HTML

Thew new `System.writeChoices` method allows you to give a list of
situation id's and have Undum generate a standard looking block of
choices.

It does this by asking each choice how it prefers to be displayed, by
calling its `optionText` method. This allows situtions to change how
they are displayed depending on the current state of the character.

Also called is the situations `canChoose` method. This will normally
return true, but if it returns false, the option will still be
displayed, but not as a link, and will not be clickable. This allows
you to show the player that an option would be available, if they did
something else first, such as increase a quality.

On its own `System.writeChoices` is still mostly manual: it finds the
link text for you, and builds the HTML, but you still have to give it
a set of situation ids that you want for your choices.

# Generating Choices

Undum now also provides the `System.getSituationIdChoices` method
which automatically compiles a list of situation ids, which can then
be passed to `System.writeChoices` for display. This method is
powerful and complex, so we'll explore its use in increasing depth.

## Generating Choices by Tags

Situations now can have one or more tags associated with them. You can
ask `System.getSituationIdChoices` to return the ids of any situtions
that match a tag. This allows you to easily build decisions that you
can extend later. You might have a 'chapter' tag, and you mark each
situation which begins a chapter using this tag, you can then do.

    system.getSituationIdChoices(['#chapter'])

to return all chapter choices.

The way tags are processed tries to be intelligent. You can match on
more than one tag, and any situation matching either tag will be
returned, but each situation will be returned no more than once. You
can even mix tags and explicit situation ids:

    system.getSituationIdChoices(['#chapter', 'introduction', '#endmatter'])

When you only need to pass one tag to `System.getSituationIdChoices`
you can do so without using a list, so the first example above could
be equally written:

    system.getSituationIdChoices('#chapter')


## Ordering Choices

Choices returned by `System.getSituationIdChoices` will be ordered
based on a new `displayOrder` numeric property of situations. This
allows you to make sure situations appear in a logical order,
regardless of whether they were selected by id or by tag.


## Conditional Appearance

So far, any matched situation will always be featured in the list of
choices. A situation can't be visible some times and not others,
depending on the current state of the game. (As we saw with the
`canChoose` method, we can have it be clickable only in some states).

To allow situations to be totally absent in some cases, there is a new
`canView` method on situations. This is only used by
`system.getSituationIdChoices`, and allows a situation to opt out of
being included, if its conditions for appearance are not met. This
allows us to implement the secret panel from the introduction.

We could have a 'go-to-the-basement' situation with tag
'from-the-hallway' available always, while 'go-to-the-secret-room' has
the tag 'from-the-hallway', but a canView method:

    secretRoomSituation.canView = function(character, system, host) {
        return character.sandbox.has_found_secret_panel;
    }

We can then call `system.getSituationIdChoices(['#from-the-hallway'])`
and have the correct choices displayed, depending on the current state
of the game.


## Priority

One common requirement is to have a set of choices which can be
'overrulled' if some condition is true. So we might want the player to
choose where on the island to go to, but if the character is injured,
we might want to only allow the character to go to the hospital.

By default, all situations have a priority of 1. If you give a
situation a higher priority, then it will be considered first. If its
`canView` method returns true, then the high priority situation will
be the only one displayed.

So the injury example might have

- Docks tag:location canView:always priority:1
- Market tag:location canView:always priority:1
- Hospital tag:location canView:when hits < 10 priority:2
- Doctor tag:location canView:when hits < 10 priority:2

Then if the hits quality = 10, we'd see

- Docks
- Market

but if the hits quality dropped to 9, we'd see just

- Hospital
- Doctor

Note that any number of results can be displayed in both cases, but
the higher priorities mask the lower ones.

If you are working with choices that all have a canView function, it
is a good idea to have a 'fallback' situation that can always be
viewed, but has a priority of zero. This will only be visible if none
of the others are available, and will prevent the game from ending at
that point.


## Maximum Choices

When you ask for a list of choices, you can specify a maximum number
to return. If more than this number of choices are available, then the
system will select a random subset to return, to make sure you get the
number you asked for.

By default, all matching situations are equally likely to be returned,
but you can make some situations rarer or more common by setting their
`frequency` value. By default, this value is 1 for a situation.

A situation with a frequency of 100 will be chosen 100 times more
often than a situation with a frequency of 1, if there is one
situation that needs selecting. In cases where more than one situation
needs chosing, the frequencies are a little less intuitive.

Consider three situations with frequencies of 1, 1, 100, competing for
two spaces. The 100-frequency situation will be chosen almost every
time, but for the other space, one of the 1-frequency situations must
be chosen. So the actual probabilities will be roughly 50%, 50%, 100%,
even though the frequencies were 1, 1, 100. When selecting more than
one result, frequencies can only be a guide.


## Minimum Choices

Although rarely used, you can also ask for a minimum number of
choices. This changes the way priority values work. It starts from the
highest priority situations, as normal, but rather than returning only
those at the highest priority level, it checks to see if that set is
enough to meet its minimum. If not, then the next priority level down
will be considered as well, and so on, until the minimum is reached.

If a minimum and a maximum is given (the maximum being at least as
large as the minimum), then only the lowest priority situations will
be randomly selected for any remaining spaces, higher priority
situations will be guaranteed to be chosen.

The most common use of this parameter is to set a very high value,
such as Number.INT_MAX, with no maximum limit. This ensures that all
valid situations are returned, regardless of their priority level.


## Choices and SimpleSituation

`SimpleSituation` provides built-in support for ending its content
with a block of choices, using `System.getSituationIdChoices` to
generate the list and `System.writeChoices` to generate the HTML. To
use this, simply pass in the list of ids and tags as the `choices`
option. You can additionally specify `minChoices` and `maxChoices` if
you need them.

As for `System.getSituationIdChoices`, if you are only using a single
tag or id, you can give this as a string, rather than a single element
list.

