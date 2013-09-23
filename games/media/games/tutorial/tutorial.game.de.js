// ---------------------------------------------------------------------------
// Bearbeite diese Datei, um dein Spiel zu erstellen. Sie sollte
// mindestens die folgenden vier Abschnitte enthalten:
// undum.game.situations, undum.game.start,
// undum.game.qualities, und undum.game.init.
// ---------------------------------------------------------------------------

/* Eine eindeutige Kennung fuer das Spiel (wird nicht im Spiel angezeigt)
 * Man kann eine UUID benutzen oder etwas anderes, was garantiert einzigartig
 * ist, z.B. eine eigene URL oder eine Variation der eigenen E-Mail-Adresse). */
undum.game.id = "349baf43-9ade-49a8-86d0-24e3de3ce072";

/* Eine Zeichenkette, die angibt, um welche Version des Spiels es sich handelt. 
 * Dies ist wichtig fuers Speichern und Laden: Wenn man den Inhalt eines Spiels
 * aendert, funktioniert ein gespeicherter Spielstand wahrscheinlich nicht mehr.
 * Wenn man nach einer Aenderung des Inhalts diese Versionsnummer ebenfalls
 * aendert, dann wird damit verhindert, dass Undum einen Spielstand aus einer 
 * alten Version zu laden versucht und dabei eventuell abstuerzt. */
undum.game.version = "1.0";

/* Die Situationen, in denen das Spiel sich befinden kann. Jede hat eine eindeutige Kennung. */
undum.game.situations = {
    start: new undum.SimpleSituation(
        "<h1>Los geht's mit Undum</h1>\
        <img src='media/games/tutorial/woodcut1.png' class='float_right'>\
        <p>Willkommen beim Undum-Tutorium. Mit Undum kann man\
        interaktive Literatur in Hypertext-Form schreiben. Seine Features\
        und seine visuelle Gestaltung sind dazu gedacht, Spiele zu machen, die eine\
	Geschichte erz&auml;hlen.</p>\
        \
        <p>Interaktive Literatur im Hypertext-Format ist im Grunde eine digitale\
        Ausgabe der beliebten Spielb&uuml;cher. Die Geschichte wird in kleinen\
        Abschnitten erz&auml;hlt, und der Spieler w&auml;hlt eine von mehreren\
        M&ouml;glichkeiten aus, wie es weitergehen soll. Anders als die B&uuml;cher\
        von fr&uuml;her ist die digitale Ausgabe aber viel flexibler - man kann\
        variantenreichere Geschichten erz&auml;hlen und interessantere\
	Spiel-Elemente einbauen.</p>\
        \
        <p class='transient'>Erstmal geht's jetzt mit dem Tutorium weiter.\
        <a href='rooms'>Klick auf diesen Link</a>, um fortzufahren.</p>"
    ),
    // Zur Abwechslung definieren wir hier mal eine Situation mit Hilfe des
    // allgemeinen "Situation"-Datentyps. Auf diese Weise erzeugen wir
    // Text, indem wir ihn aus der HTML-Datei des Spiels ziehen. Das ist bei statischem Text
    // sinnvoller als ihn hier komplett auszuschreiben.
    rooms: new undum.Situation({
        enter: function(character, system, from) {
            system.write($("#s_rooms").html());
        }
    }),
    todo: new undum.SimpleSituation(
        "<p>Zwei Dinge k&ouml;nnen in einer Situation passieren. Entweder\
        <a href='links'>verl&auml;sst</a> die Spielfigur diese Situation und ger&auml;t\
        in eine andere, oder sie f&uuml;hrt eine <a href='./do-something'>Aktion</a> aus.\
        Aktionen k&ouml;nnen z.B. Daten verarbeiten und Ergebnisse anzeigen,\
        aber letztlich kehrt die Spielfigur dabei immer wieder in dieselbe Situation\
        zur&uuml;ck.</p>\
        \
        <p>Wenn du dein Spiel entwirfst, dann benutze Situationen, um darzustellen,\
        dass die Spielfigur nun etwas Neues tun kann. Wechsle z.B. in eine neue\
        Situation, wenn der Spieler einen Hebel zieht und dadurch eine Fallt&uuml;r\
        &ouml;ffnet. Aktionen sind dagegen f&uuml;r Situationen gedacht, in denen\
        die Spielfigur Dinge genauer untersuchen kann, oder z.B. einen Zaubertrank\
        trinken kann, um ihren Magie-Wert aufzustocken. Kurz gesagt Handlungen,\
	die den Zustand der Umgebung nicht ver&auml;ndern.</p>\
        \
        <p>Situationen erzeugen Text, wenn man in sie hineinger&auml;t <em>(enter)</em>,\
        wenn man sie verl&auml;sst <em>(exit)</em>, und wenn man in ihnen\
	eine Aktion ausf&uuml;hrt <em>(act)</em> (die kursiv gesetzten\
        Begriffe sind die Namen der drei Methoden, die im Code daf&uuml;r benutzt werden).\
        Wenn man m&ouml;chte, kann man mit eigenem Code den erzeugten\
        Inhalt beliebig ver&auml;ndern; der Inhalt ist dynamisch, dadurch\
        kann man z.B. den momentanen Zustand der Spielfigur ber&uuml;cksichtigen.\
        Der Inhalt besteht einfach aus normalem HTML, also kann man die\
	&uuml;blichen HTML-Tags benutzen, um Text\
        <strong>fett</strong> oder <em>kursiv</em> zu machen,\
        oder um Bilder einzubauen. Hier hast du viele M&ouml;glichkeiten,\
        z.B. k&ouml;nntest du <em>audio</em> oder\
        <em>video</em> Tags nehmen, um Multimedia-Inhalte anzuzeigen\
	(Undum ist auf HTML5 ausgelegt).</p>\
        \
        <p class='transient'>Probiere bitte die Aktion oben aus,\
        dann <a href='links'>geht's weiter</a>.</p>",
        {
            actions: {
		// wenn eine Aktions-Kennung einen Bindestrich enthaelt wie die Folgende,
		// dann sollte sie in (einfachen oder doppelten) Anfuehrungsstrichen stehen
                'do-something': "<p>Du hast die Aktion ausgef&uuml;hrt, gut gemacht.\
                                 Wie du siehst, sind die Links f&uuml;r diese\
                                 Situation immer noch aktiv. Das bedeutet,\
                                 dass du sie noch einmal anklicken und damit\
				 die Aktion ausf&uuml;hren kannst.</p>"
            }
        }
    ),
    links: new undum.SimpleSituation(
        "<h1>Ver&auml;nderlicher Inhalt</h1>\
        <p>Vor jedem neuen Textabschnitt f&uuml;gt Undum eine\
        kleine Linie am Rand ein. Damit kann der Spieler auf einen Blick\
        erfassen, was durch den letzten Klick neu ausgegeben wurde.\
        Das ist besonders auf mobilen Ger&auml;ten mit kleinen Bildschirmen\
	n&uuml;tzlich, oder wenn eine Menge Text auf einmal\
        dazugekommen ist. Die Anzeige wird au&szlig;erdem so gescrollt,\
        dass der Anfang des neuen Abschnitts nah am oberen Fensterrand\
	ist.\
        Dies soll einen nat&uuml;rlichen Lesefluss erm&ouml;glichen.</p>\
        \
        <p>Wenn du genau hingeschaut hast, ist dir bestimmt aufgefallen,\
        dass Teile des Textes verschwunden sind, als in neue Situationen\
        gewechselt wurde. Das ist kein Bug! Es ist eines der Ziele von Undum,\
        dass Entwickler ihr Spiel so gestalten k&ouml;nnen, dass das\
        Transkript des Spielablaufs sich wie eine durchgehende, koh&auml;rente\
	Erz&auml;hlung liest. Allerdings ben&ouml;tigt man oft Textschnipsel, die\
        nur dazu da sind, dem Spieler Auswahlm&ouml;glichkeiten anzuzeigen.\
        Undum stellt daf&uuml;r eine besondere CSS-Klasse bereit, die man in\
        den eigenen HTML-Inhalt einbaut (wie gesagt, s&auml;mtlicher Inhalt\
	besteht ja einfach aus HTML). Diese Klasse hei&szlig;t <em>transient</em>\
        ('vor&uuml;bergehend') und man kann sie auf Abs&auml;tze, <em>div</em>s, oder\
        <em>span</em>s<span class='transient'> (so wie hier)</span> anwenden.</p>\
        \
        <p>Vielleicht ist dir auch aufgefallen, dass beim Wechsel in eine neue\
        Situation alle Links in der vorherigen Situation sich in normalen Text verwandeln.\
        Das verhindert, dass der Spieler zur&uuml;ckgeht und eine andere Option\
        ausprobiert, nachdem er sich bereits f&uuml;r eine entschieden hat.\
        In anderen Hypertext-Systemen wird das oft so gehandhabt, dass\
        der Inhalt fr&uuml;herer Seiten komplett gel&ouml;scht wird.\
	Allerdings kann man in solchen Systemen dann nicht mehr\
	zur&uuml;ckbl&auml;ttern, um die gesamte Geschichte zu lesen.</p>\
        \
        <p class='transient'>Gleich erf&auml;hrst du mehr &uuml;ber diese Links\
        und wie du ihre Wirkungsweise <a href='sticky'>&auml;ndern kannst</a>.</p>"
    ),
    sticky: new undum.SimpleSituation(
        "<h1>Links</h1>\
        <p>Es gibt drei Arten von Links in Undum. Zwei kennen wir schon:\
        Links, mit denen man in eine neue Situation wechselt, und Links,\
	die eine Aktion ausf&uuml;hren. Wenn du einen Link in deinen\
        Ausgabetext einbaust, dann verarbeitet Undum den Link und\
        sorgt f&uuml;r die richtige Verbindung. Wenn du einen Link machst,\
	in dem das HTML-Attribut <em>href</em> nur einen Namen\
        enth&auml;lt (z.B. 'ballsaal'), dann schickt der Link die Spielfigur\
        zu der Situation, die diesen Namen hat. Links mit zwei Teilen\
        ('ballsaal/betrachte-gemaelde', z.B.) schicken die Spielfigur in\
        die so benannte Situation <em>und f&uuml;hren dann</em>\
        die genannte Aktion aus ('betrachte-gemaelde').\
        Um innerhalb der momentanen Situation eine Aktion\
        ausf&uuml;hren zu lassen, kannst du den Situationsnamen durch\
        einen Punkt ersetzen (z.B. so: './betrachte-gemaelde').\
        In allen F&auml;llen gilt: Wenn die Spielfigur schon in der Situation\
        ist, dann wird deren <em>enter</em>-Methode nicht noch einmal aufgerufen.</p>\
        \
        <img src='media/games/tutorial/woodcut2.png' class='float_left'>\
        <p>Die dritte Art von Link ist ein allgemeiner Hyperlink. Wenn dein\
        Link nicht aus nur einem Element bzw. zwei Elementen besteht wie\
        oben, dann vermutet Undum, dass es sich um einen normalen Hyperlink\
        handelt, so wie <a href='http://news.bbc.co.uk' class='sticky' target='_blank'>bei diesem</a>.\
        Wenn du einen Link hast, der wie ein Undum-Link <em>aussieht</em>,\
        kannst du Undum trotzdem zwingen, ihn nicht als Aktions- oder\
        Situations-Link zu behandeln, indem du dem HTML <em>a</em>-Tag\
	die CSS-Klasse <em>raw</em> hinzuf&uuml;gst.\
        Denjenigen Links, die nicht die <em>raw</em>-Klasse haben, und die aber als\
        Nicht-Undum-Links angesehen werden (wie der oben), wird <em>raw</em>\
        hinzugef&uuml;gt, bevor sie angezeigt werden. Das erlaubt dir, externe\
        Links in einem anderen Stil darzustellen (siehe oben).</p>\
        \
        <p>In der letzten Situation wurde erw&auml;hnt, dass man verhindern\
        kann, dass Links bei einem Situationswechsel in normalen Text verwandelt\
        werden. Das geht mit einer weiteren CSS-Klasse: <em>sticky</em> ('klebrig').\
        Wenn du <a href='oneshot'>diese Situation verl&auml;sst</a>, wirst du sehen,\
        dass der externe Link aktiv bleibt. Dadurch ist es m&ouml;glich, Optionen\
        anzubieten, die w&auml;hrend der gesamten Geschichte g&uuml;ltig bleiben, z.B.\
        einen Zauberspruch, mit dem die Spielfigur sich nach Hause teleportieren kann.</p>"
    ),
    oneshot: new undum.SimpleSituation(
        "<p>Es gibt noch folgende Variante f&uuml;r die Link-Darstellung:\
        Wenn man einem Link die CSS-Klasse <em>once</em> ('einmal') verpasst,\
        dann verschwindet der Link, nachdem er angeklickt wurde. Das kannst\
        du (wie bei <a href='./one-time-action' class='once'>diesem Link</a>)\
        f&uuml;r Aktionen benutzen, die nur einmal ausf&uuml;hrbar sein\
	sollen. Bei Situations-Links ist <em>once</em> witzlos, denn die werden ja\
        sowieso in normalen Text verwandelt, sobald sie angeklickt wurden\
        (au&szlig;er nat&uuml;rlich, wenn sie als <em>sticky</em>\
        deklariert sind).</p><p>Die <em>once</em>-Links eignen sich z.B.\
        f&uuml;r eine Aktion wie das genaue Untersuchen eines Gegenstands.\
        Es s&auml;he nicht sch&ouml;n aus, wenn so eine Beschreibung eines\
        Gegenstands mehrfach wiederholt w&uuml;rde - ein\
	<em>once</em>-Link ist da benutzerfreundlicher.</p>\
        <p>Wenn mehr als ein Link zu derselben Aktion f&uuml;hrt,\
        dann werden alle diese Links deaktiviert, also brauchst du\
        dir keine Sorgen zu machen, dass der Spieler die Aktion\
	noch einmal auf anderem Wege ausf&uuml;hren k&ouml;nnte.</p>\
        <p class='transient'>Nachdem du oben auf den Link geklickt hast, k&ouml;nnen wir\
        <a href='qualities'>weitermachen</a>.</p>",
        {
            actions: {
                "one-time-action": "<p>Wie gesagt, einmalige Aktionen\
                                   werden oft dazu genutzt, Dinge detaillierter\
                                   zu beschreiben; man m&ouml;chte dabei nicht,\
                                   dass ein und derselbe Beschreibungstext\
                                   &uuml;ber und &uuml;ber wiederholt wird.</p>"
            }
        }
    ),
    qualities: new undum.SimpleSituation(
        "<h1>Eigenschaften</h1>\
        <p>Genug von Situationen! Lass uns &uuml;ber die Spielfigur sprechen.\
        Die Spielfigur wird durch ihre <em>qualities</em> ('Eigenschaften')\
	bestimmt. Das sind Zahlenwerte, die f&uuml;r alles m&ouml;gliche\
	stehen k&ouml;nnen, z.B. F&auml;higkeiten oder Ressourcen,\
        die die Figur besitzt. Die Eigenschaften werden in dem Feld\
	rechts neben dem Haupttext angezeigt.</p>\
        \
        <p>Die Eigenschaften dort sind bei Spielbeginn zugewiesen worden. Wenn\
        du gleich <a href='quality-types'>zur n&auml;chsten Situation gehst</a>,\
        schau genau auf das Feld. Wie du siehst, bekommst du\
        einen St&auml;rke-Bonus. Dieser Vorgang wird animiert und hervorgehoben,\
        damit der Spieler darauf aufmerksam wird. Wenn du m&ouml;chtest,\
        kannst du dir auch noch mit <a href='./skill-boost'>dieser Aktion</a>\
        einen Gewandtheits-Bonus holen - so oft wie du willst.</p>",
        {
            actions: {
                "skill-boost": function(character, system, action) {
                    system.setQuality("skill", character.qualities.skill+1);
                }
            },
            exit: function(character, system, to) {
                system.setQuality("stamina", character.qualities.stamina+1);
            }
        }
    ),
    // wenn eine Situations-Kennung einen Bindestrich enthaelt wie die Folgende,
    // dann sollte sie in Anfuehrungsstrichen stehen
    "quality-types": new undum.SimpleSituation(
        "<p>Nicht alle Eigenschaften werden im Spielfiguren-Feld als\
        Zahlen aufgelistet. Intern sind sie zwar alle Zahlen, aber sie\
        k&ouml;nnen verschieden angezeigt werden. 'Gl&uuml;ck' z.B.\
        wird in Worten dargestellt (die auf der Skala aus dem\
	FUDGE-Rollenspielsystem beruhen), und 'Novize' hat nur\
        ein H&auml;kchen.</p>\
        \
        <p>Du kannst sehen, wie sich das Gl&uuml;ck ver&auml;ndert, wenn\
        du mal diese <a href='./luck-boost'>gl&uuml;cks-erh&ouml;hende</a>\
        und diese <a href='./luck-reduce'>gl&uuml;cks-verringernde</a>\
        Aktion probierst. Wenn die Wort-Skala ausgesch&ouml;pft ist, wird\
	ein zahlenm&auml;&szlig;er Bonus bzw. Malus angeh&auml;ngt.\
        Undum bringt eine Reihe verschiedener Anzeigetypen mit, und man\
        kann auch einfach eigene hinzuf&uuml;gen.</p>\
        \
        <p>Wenn du <a href='character-text'>diese Situation verl&auml;sst</a>,\
        wird 'Novize' auf Null gesetzt. Im Spielfiguren-Feld kannst du gleich sehen,\
        dass 'Novize' verschwindet, und wenn die letzte Eigenschaft aus einer\
        Gruppe entfernt wird ('Novize' ist in der Gruppe 'Fortschritt'), dann\
        verschwindet die Gruppen-&Uuml;berschrift ebenfalls. Man kann selbst\
        festlegen, zu welcher Gruppe jede Eigenschaft geh&ouml;rt, und in\
        welcher Reihenfolge sie aufgelistet werden sollen.\
        <p>",
        {
            actions: {
                "luck-boost": function(character, system, action) {
                    system.setQuality("luck", character.qualities.luck+1);
                },
                "luck-reduce": function(character, system, action) {
                    system.setQuality("luck", character.qualities.luck-1);
                }
            },
            exit: function(character, system, to) {
                system.setQuality("novice", 0);
            }
        }
    ),
    "character-text": new undum.SimpleSituation(
        "<h1>Spielfiguren-Text</h1>\
        <p>&Uuml;ber der Liste mit den Eigenschaften steht ein kurzer Text,\
        den wir den Spielfigur-Text ('character-text') nennen wollen. Dieser kann\
        dazu genutzt werden, eine kurze Beschreibung der Spielfigur zu geben.\
	Der Text kann durch eine Aktion oder beim Wechsel zwischen Situationen\
	ge&auml;ndert werden. Es handelt sich, wie auch sonst &uuml;berall in\
        Undum, um normales HTML. Man kann auch hier Undum-Links einbauen,\
        z.B. Aktionen, die die Spielfigur zu jedem Zeitpunkt ausf&uuml;hren kann.\
        </p>\
        <p class='transient'>Lass uns zur\
        <a href='progress'>n&auml;chsten Situation gehen</a>.\
        W&auml;hrenddessen &auml;ndere ich den Spielfiguren-Text. Er wird dabei\
        hervorgehoben, so wie wenn man eine Eigenschaft &auml;ndert.</p>",
        {
            exit: function(character, system, to) {
                system.setCharacterText(
                    "<p>Wir n&auml;hern uns dem Ende des Wegs.</p>"
                );
            }
        }
    ),
    progress: new undum.SimpleSituation(
        "<h1>Fortschritt anzeigen</h1>\
        <p>Manchmal m&ouml;chte man, dass es als wichtiges Ereignis\
        wahrgenommen wird, wenn sich eine Eigenschaft &auml;ndert. Deshalb\
        kann man die &Auml;nderung auch animiert darstellen. Wenn du\
	<a href='./boost-stamina-action'>deine St&auml;rke steigerst</a>,\
	wirst du die &Auml;nderung wie &uuml;blich im Spielfiguren-Feld sehen,\
        aber zus&auml;tzlich erscheint unten eine animierte Fortschrittsanzeige.</p>",
        {
            actions: {
                // Hier gehen wir einen indirekten Weg - der Link fuehrt eine Aktion aus,
                // die ihrerseits doLink benutzt, um die Situation direkt zu aendern.
                // Das ist nicht die empfohlene Methode (man haette die Situation 
                // einfach im Link aendern koennen), aber sie zeigt, wie man doLink verwendet.
                "boost-stamina-action": function(character, system, action) {
                    system.doLink("boost-stamina");
                }
            },
            exit: function(character, system, to) {
                system.animateQuality(
                    'stamina', character.qualities.stamina+1
                );
            }
        }
    ),
    "boost-stamina": new undum.SimpleSituation(
        "<p>Die Fortschrittsanzeige ist auch n&uuml;tzlich, wenn im\
        Spielfigur-Feld der Wert einer Eigenschaft als ganze Zahl\
        angezeigt wird, und eine Aktion nur eine Nachkomma-Stelle der\
        Eigenschaft &auml;ndert. Wenn eine Eigenschaft z.B. die\
	Erfahrungsstufe der Spielfigur anzeigt und die Figur dann einige\
	Erfahrungspunkte hinzugewinnt, dann kann man die\
        Fortschrittsanzeige benutzen, um anzuzeigen, wie nah die\
	Figur an der n&auml;chsth&ouml;heren Stufe ist.</p>\
        \
        <img src='media/games/tutorial/woodcut3.png' class='float_right'>\
        <p>Nach ein paar Sekunden verschwindet die Fortschrittsanzeige,\
        damit der Leser nicht zu sehr vom Text abgelenkt wird. Undum ist\
        nicht unbedingt daf&uuml;r gemacht, z.B. ein Strategiespiel\
	darzustellen, bei dem man st&auml;ndig viele Statistiken im Blick haben\
        muss. Wenn eine Eigenschafts&auml;nderung ein permanenter Teil\
	der aufgezeichneten Geschichte werden soll, dann sollte sie im\
	Text auftauchen.</p>\
        \
        <p>Nun sind wir bald am Ende des Weges angelangt. Bisher\
        haben wir uns jedoch nur linear durch dieses Tutorium fortbewegt - \
        von einer Situation zur n&auml;chsten, ganz ohne Entscheidungen.\
        Undum ist aber nat&uuml;rlich darauf ausgelegt, Erz&auml;hlungen zu\
	schreiben, die sich verzweigen und wieder zusammenflie&szlig;en.</p>\
        \
        <p class='transient'>Hier ein winziges Beispiel zur\
        Veranschaulichung - w&auml;hle einen der Zweige:</p>\
        <ul class='options'>\
            <li><a href='one'>Option Eins</a>, oder</li>\
            <li><a href='two'>Option Zwei</a>.</li>\
        </ul>\
        <p class='transient'>Der Optionen-Block oben ist eine normale HTML\
        'unordered list' (<em>ul</em>-Tag) mit der speziellen\
	<em>options</em>-Klasse. Klick auf eine der Zeilen (die gesamte Breite\
	ist anklickbar), um die entsprechende Option zu w&auml;hlen.</p>"
    ),
    one: new undum.SimpleSituation(
        "<h1>Option Eins</h1>\
        <p>Du hast Option Eins gew&auml;hlt, was wahrscheinlich auch besser so ist, denn\
        Option Zwei ist in schlecht gereimtem Koptisch verfasst.\
        </p>\
        <p>Von hier ist es nur ein <a href='saving'>kleiner Schritt</a> zum\
        Rest des Tutoriums.</p>"
    ),
    "two": new undum.SimpleSituation(
        "<h1>Option Zwei</h1>\
        <p>Du hast Option Zwei gew&auml;hlt - die gef&auml;llt mir auch am besten.\
        Die Photos, die bei Option Eins auftauchen, sind einfach zu verst&ouml;rend.\
        Fingern&auml;gel sollte man nicht auf so eine Art verbiegen...</p>\
        <p>Von hier ist es nur ein <a href='saving'>kleiner Schritt</a> zum\
       Rest des Tutoriums.</p>"
    ),
    // An dieser Stelle ziehen wir den gewuenschten Text wieder aus der HTML-Datei.
    "saving": new undum.Situation({
        enter: function(character, system, from) {
            system.write($("#s_saving").html());
        }
    }),
    "last": new undum.SimpleSituation(
        "<h1>Wie geht es nun weiter</h1>\
        <p>So, das war's mit unserem Rundgang durch Undum. Diese Situation\
        ist das Ende, denn sie stellt keine weiteren Links bereit. Der 'Ende'-Hinweis unten ist\
        einfach Teil des ausgegebenen HTMLs in dieser Situation, er ist nicht speziell\
        in Undum eingebaut.</p>\
        \
        <p>Deine Figur hat jetzt eine Eigenschaft hinzugewonnen - Inspiration!\
        Zeit f&uuml;r dich, die Spieldatei zu &ouml;ffnen und deine eigene Geschichte\
        zu schreiben!</p>\
        <h1>Ende</h1>",
        {
            enter: function(character, system, from) {
                system.setQuality("inspiration", 1);
                system.setCharacterText(
                    "<p>Du f&uuml;hlst dich inspiriert - versuch's doch auch einmal!</p>"
                );
            }
        }
    )
};

// ---------------------------------------------------------------------------
/* Die Kennung der Start-Situation. */
undum.game.start = "start";

// ---------------------------------------------------------------------------
/* Hier definieren wir die Eigenschaften (qualities) unserer Hauptfigur.
 * Wir muessen sie nicht erschoepfend auflisten, aber wenn eine hier nicht
 * auftaucht, dann wird sie nicht in der "Spielfigur"-Leiste der Benutzeroberflaeche angezeigt. */
undum.game.qualities = {
    skill: new undum.IntegerQuality(
        "Gewandtheit", {priority:"0001", group:'stats'}
    ),
    stamina: new undum.NumericQuality(
        "<span title='St&auml;rke war in den deutschen Ausgaben der Fighting-Fantasy-Spielb&uuml;cher die &uuml;bliche &Uuml;bersetzung f&uuml;r stamina - gemeint sind Kraft, Gesundheit, Ausdauer, Lebensenergie.'>St&auml;rke</span>", {priority:"0002", group:'stats'}
    ),
    luck: new undum.FudgeAdjectivesQuality( // Fudge bezieht sich auf das FUDGE-Rollenspielsystem
        "<span title='Gewandtheit, St&auml;rke und Gl&uuml;ck stammen aus den hochverehrten Fighting-Fantasy-Spielb&uuml;chern. Die Bezeichnungen f&uuml;r die Gl&uuml;cksstufen kommen aus dem FUDGE-Rollenspielsystem. Dieser Tooltip zeigt, dass man beliebiges HTML im Label einer Eigenschaft verwenden kann (in diesem Fall ein span mit einem title attribute).'>Gl&uuml;ck</span>",
        {priority:"0003", group:'stats'}
    ),
    inspiration: new undum.NonZeroIntegerQuality(
        "Inspiration", {priority:"0001", group:'progress'}
    ),
    novice: new undum.OnOffQuality(
        "Novize", {priority:"0002", group:'progress', onDisplay:"&#10003;"}
    )
};

// ---------------------------------------------------------------------------
/* Die Eigenschaften werden in der "Spielfigur"-Leiste in Gruppen angezeigt.
 * Hier werden die Gruppen festgelegt und ihre Reihenfolge und ihre Ueberschriften
 * bestimmt (wobei null bedeutet, dass die Gruppe keine Ueberschrift hat). 
 * Eigenschaftsdefinitionen ohne Gruppe erscheinen am Ende.
 * Wenn eine Eigenschaftsdefinition einer nicht-existenten Gruppe
 * zugeordnet wird, ist das ein Fehler. */
undum.game.qualityGroups = {
    stats: new undum.QualityGroup(null, {priority:"0001"}),
    progress: new undum.QualityGroup('Fortschritt', {priority:"0002"})
};

// ---------------------------------------------------------------------------
/* Diese Funktion wird vor dem Start des Spiels ausgefuehrt. Normalerweise
 * konfiguriert man hiermit die Eigenschaften der Hauptfigur bei Spielbeginn. */
undum.game.init = function(character, system) {
    character.qualities.skill = 12;
    character.qualities.stamina = 12;
    character.qualities.luck = 0;
    character.qualities.novice = 1;
    character.qualities.inspiration = 0;
    system.setCharacterText("<p>Du bist am Beginn einer aufregenden Reise.</p>");
};
