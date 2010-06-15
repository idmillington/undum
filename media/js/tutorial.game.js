// ---------------------------------------------------------------------------
// Edit this file to define your game. It should have at least four
// sets of content: undum.game.situations, undum.game.start,
// undum.game.qualities, and undum.game.init.
// ---------------------------------------------------------------------------

/* Definitions and aliases for data used below. */

var FUDGE_WORDS = [
    'terrible','bad','poor','mediocre','fair','good','great','superb','awesome'
];

// ---------------------------------------------------------------------------
/* The situations that the game can be in. Each has a unique ID. */
undum.game.situations = {
    start: new undum.ActionSituation(
        "<p>It was a\
         dark and stormy night. <span class='transient'>And nothing was\
         stirring, not even a <a href='leave'>mouse</a>.</span> You could\
         <a class='sticky' href='start/light'>light a candle</a>, to see \
         what's  <a href='/' class='raw'>going on</a>. Or you could\
         <a href='leave'>leave</a>.</p>",

        // Responses to action codes:
        {
            light: function(character, system, action) {
                system.animateQuality(
                    "luck", character.qualities.luck + 1, {
                        from: 0.6,
                        to: 0.2
                    }
                );
                system.setQuality('blessed', 0);
                return "<p>The lamp flickers into life.</p>";
            }
        },

        // Other options and function overrides:
        {
            heading: "Where You Start",
            exit: function(character, system, from) {
                system.setQuality("magic", 1);
                system.setCharacterText("You feel all magical!");
                return true;
            },
        }
    ),

    leave: new undum.SimpleSituation(
        "<p>You have left, goodbye.</p>"
    )
};

// ---------------------------------------------------------------------------
/* The Id of the starting situation. */
undum.game.start = "start";

// ---------------------------------------------------------------------------
/* Here we define all the qualities that our characters could
 * possess. We don't have to be exhaustiv, but if we miss one out then
 * that quality will never show up in the character bar in the UI. */
undum.game.qualities = {
    skill: new undum.IntegerQuality(
        "Skill", {priority:"0001", group:'stats'}
    ),
    stamina: new undum.NumericQuality(
        "Stamina", {priority:"0002", group:'stats'}
    ),
    luck: new undum.WordScaleQuality(
        "Luck", FUDGE_WORDS, {offset:-4, priority:"0003", group:'stats'}
    ),

    magic: new undum.IntegerQuality(
        "Magic", {priority:"0001", group:'magic'}
    ),
    blessed: new undum.OnOffQuality(
        "Blessed", {priority:"0002", group:'magic', onValue:"&#10003;"}
    )
};

// ---------------------------------------------------------------------------
/* The qualities are displayed in groups in the character bar. This
 * determines the groups, their heading (which can be null for no
 * heading) and ordering. QualityDefinitions without a group appear at
 * the end. It is an error to have a quality definition belong to a
 * non-existent group. */
undum.game.qualityGroups = {
    stats: new undum.QualityGroup(null, {priority:"0000"}),
    magic: new undum.QualityGroup('Magic', {priority:"0001"})
};

// ---------------------------------------------------------------------------
/* This function gets run before the game begins. It is normally used
 * to configure the character at the start of play. */
undum.game.init = function(character, system) {
    character.qualities.skill = 12;
    character.qualities.stamina = 12;
    character.qualities.luck = 0;
    character.qualities.blessed = 1;
    system.setCharacterText("Hello.");
};
