# Home

# Contents

## <a href="./introduction.html">High level overview</a>

Describes the concepts that go into an Undum game, and how they
interact.

## <a href="./creating.html">Creating an Undum Game</a>

Describes the files you need to create to make an Undum game, and what
needs to go into them.

## <a href="./implicit.html">Implicit Choices</a>

Version 2 of Undum includes a new framework for automatically
generating choices for the player, based on information stored in
situations.

## <a href="./HTML.html">HTML API</a>

Undum games use HTML to output text and media, but has some
constraints on the HTML you can use. Undum also provides built-in
behavior tied to specific HTML classes that you can use in your
output. In v.2, Undum also added support for defining many kinds of
situation entirely in HTML, with no Javascript needed.

## <a href="./API.html">Javascript API</a>

A complete breakdown of the API exposed to your code via
Javascript. This details the methods that you call to output content,
find random numbers and translate your game.

## <a href="./i18n.html">Translation and Internationalization</a>

Describes Undum's core translation system, and how you can create
games that support multiple languages.

## <a href="./files.html">Loading and Saving</a>

Undum has an unusual way of supporting loading and saving of games, to
support a wide range of browsers, sites and game styles. This document
contains the technical details, and how this affects you as a game
author.


# Undum Changelog

## 2011-05-27

- Added `System.writeBefore` to do out of order insertion. (credit:
  ekyrath)

- Added an optional selector to `System.write` and
  `System.writeBefore` to support out of order insertion. (credit:
  ekyrath)

- Removed the use of `__defineGetter__`, so that the core code now
  works on IE7 (thanks for the bug report juhana and bloomengine).

## 2011-08-18

- Added support for functions in the `content` and `header` of a
  `SimpleSituation` (credit: David Eyk).

## 2013-09-27

- Updated to v.2, including support for <a
  href="./implicit.html">implicit choices</a> and <a
  href="./HTML.html">HTML-defined situations</a>.