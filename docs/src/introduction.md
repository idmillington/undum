# Introduction

# High Level Overview

Undum games are based around three concepts: Situations, Actions and
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



