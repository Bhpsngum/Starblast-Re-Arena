/*
Re:Arena - Arena Mod Remake/Recontinuation (v3.1.3 - v4.0+)
- CEO: Tost
- Coding: Bhpsngum
- Textures: Caramel
- Ships: Caramel
- Maps: Supernova, Caramel, Bylolopro, Nerd69420, Megalodon, and others
- Contributors: Tost, Caramel, Lexydrow, Akira, and others

GitHub Repository: https://github.com/Bhpsngum/Arena-mod-remake

Original Arena Mod (v1.0 - v3.1.2)
- CEO: Nexagon
- Coding: Nexagon
- Textures: Nexagon, and others
- Ships: Nexagon, Edward, Supernova, and others
- Maps: Nexagon, Carme, Caramel, Nerd69420, and others
- Contributors: Lexydrow, Boris, Thuliux, Bylolopro, Caramel, Duschi, Edward, Megalodon, Supernova, ThirdToeMan, Madness, Slayer, and others
*/

const __ABILITY_SYSTEM_INFO__ = {
    name: "Arena_Mod",
    branch: "Main",
    version: "4.0.0",
    buildID: "188f2dec44e"
};



/* Dev's note

When calling `HelperFunctions.setPlaneOBJ`, if you want to set angle then set rotation like this:
{ x: Math.PI, y: 0, z: -<YOUR ANGLE> }
otherwise just do { x: 0, y: 0, z: 0 }
Reason: the plane obj is from neuronality's site, and it's weird

*/

/*
Currently, to use the Ability System (which is bundled with TeamManager and MapManager) in any mod:

1. Clone this Repository to your machine and navigate to that folder
2. Tune the files inside the "files" directory by your choice
The files below are recommended and better don't touch other files unless you know what you're doing
    - Config.js
    - Abilities.js
    - Maps.js
    - Teams.js
    - Commands.js (if you understand it, or else don't)

3. Paste your current's mod code in the templates/gameLogic.js file
Consider the things below:

// to initialize the Ability System (required):
AbilityManager.initialize()

// to get ship codes to put in `this.options`:
this.options = {
    reset_tree: true,
    ships: [
        // Your other ships, you must include the 101 since ability manager won't make you one
        AbilityManager.getShipCodes()
    ]
}

// Note that it will initialize first if it hasn't yet

// Control the tick
this.tick = function (game) {
    AbilityManager.globalTick(game);
    // your stuff here
}

// make sure to set
//    - `game.custom.abilitySystemEnabled` to `true` 
//    - `ship.custom.abilitySystemDisabled` to `false` (it should be by default)
// so that ship can use the abilities

// Control the event
this.event = function (event, game) {
    AbilityManager.globalEvent(event, game);
    // your stuff here
}

4. Install NodeJS and NPM if you haven't yet
5. Open terminal/console, move to the folder in step 1 (use cd command or whatever you want)
6. Run `npm run compile main`
7. Profit

8. You might want to keep the files you've modified and replace them with original files
if you clones/pull the updates next time
9. Also if you have enough experience with Node and related stuff,
you can fck around and find out how to compile custom templates as well
*/





/* Imported from Config_Main.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const DEBUG = true; // if in debug phase

// This is generic Ability System options only
// for Arena game options please edit in misc/GameConfig.js
const GAME_OPTIONS = {
    teams_count: 2, // number of teams
    max_players: 80, // number of max players, used to define minimum ship usage limit
    map_preset_name: null, // the name of the map used in this match (e.g Genesis or Deathwing), leave null for a randomized map
    ability: {
        include_rings_on_model: false, // the individual ship's ring model inclusion are only checked if this one is `true`
        shortcut: "X", // ability activation shortcut
        ship_levels: 6, // all ship levels
        max_stats: 1e8 - 1, // maximum stats for ships
        crystals: 720, // crystals when first set, default of `abilityTemplate.crystals`
        notice: {
            show: true, // to show it or not
            timeout: 5 * 60, // time for instructor to disappear, in ticks
            message: function (ship) { // notice message function for each ships
                // this function binds to `GAME_OPTIONS` object
                return `Greetings, Commander.
Your ship is equipped with a special ability module.
Press [${this.ability.shortcut}] to activate it.`
// Capture the point in the middle to win! Stand inside the point to capture it.`
            }
        },
        usage_limit: 3 // default usage limit of a ship in one team
        // minimum depends on number of teams, max players and number of ability ships
        // maximum Infinity, you can also omit the limit to obtain same result
        // to define different limit for a certain ship, use `usageLimit` spec in ship template
    },
    plane_3D_OBJ_Z_level: -3 // z value of 3D Plane OBJ
}

// don't remove those
GAME_OPTIONS.teams_count = Math.trunc(Math.min(Math.max(GAME_OPTIONS.teams_count, 0), 5)) || 0; // restriction
GAME_OPTIONS.max_players = Math.trunc(Math.min(Math.max(GAME_OPTIONS.max_players, 1), 240)) || 1;





/* Imported from Teams.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const Teams = [
    {
        names: ["Red", "Orange"],
        hues: [0, 30],
        instructor: "Zoltar",
        need_spawnpoint: true
    },
    {
        names: ["Cyan", "Blue"],
        hues: [180, 210],
        instructor: "Lucina",
        need_spawnpoint: true
    },
    {
        names: ["Green"],
        hues: [150],
        instructor: "Klaus",
        need_spawnpoint: true
    },
    {
        names: ["Yellow"],
        hues: [60],
        instructor: "Maria",
        need_spawnpoint: true
    },
    {
        names: ["Purple", "Pink"],
        hues: [270, 300],
        instructor: "Kan",
        need_spawnpoint: true
    }
];

const StaticTeams = [0, 1]; // list of team indices that MUST BE on list of teams regardless of randomization

const GhostTeam = {
    ghost: true,
    id: [],
    name: "Sussy Amogus",
    hue: 340,
    instructor: "Kan",
    need_spawnpoint: false
};





/* Imported from Maps.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const Maps = [
    {
        name: "Crosshair",
        author: "Carme",
        spawnpoints: [ // An array of spawnpoints to random from
            { x: 390, y: -390 },
            { x: -390, y: 390 }
        ],
        pairings: [], // An array of spawnpoints index that should be paired/grouped
        // leave blank or omit if not needed
        map:
            "99999999999999999                                66                                99999999999999999\n"+
            "999999999999999                             757757757757                             999999999999999\n"+
            "99    77777               5            7577566666666666657757                            77777    99\n"+
            "99                                 775766666444444444444666667577                                 99\n"+
            "99                   5          7756666444445 55 55 55 5444446666577          6                   99\n"+
            "99                            7566644445 5 5            5 5 5444466657                            99\n"+
            "997                         756644455 5                      5 554446657             6           799\n"+
            "997                        766445 5                              5 544667                        799\n"+
            "997                      756445                                      544657                      799\n"+
            "997                     5664 5                                        5 4665                     799\n"+
            "997                   776445          9     4     6                     544677                   799\n"+
            "99                   56645                             9                  54665             9     99\n"+
            "99                  76445                                         4        54467     5            99\n"+
            "99          6      5645                                                      5465                 99\n"+
            "99                 645                                                        546                 99\n"+
            "9                                  9                                                               9\n"+
            "9                                                                                                  9\n"+
            "                                                                     7                              \n"+
            "                                                        9                                 4         \n"+
            "             56                                    7                                 65             \n"+
            "    6       764                            7                                         467            \n"+
            "           5645                                                             9        5465           \n"+
            "          7645                                                                        5467          \n"+
            "          764                                      9                                   467      7   \n"+
            "         5645                                               4      8                   5465         \n"+
            "        7645      8              6                                                      5467        \n"+
            "        564                 6           9                               4                465        \n"+
            "       7645           4                                                                  5467       \n"+
            " 9    764                                                                     8            467      \n"+
            "      5645                                     577775                                     5465      \n"+
            "     7645   5                               579999999975                                   5467     \n"+
            "     564                                  79998 8  8 89997        6                         465     \n"+
            "    7645                      4         799  8 8 88 8 8  997                       8        5467 4  \n"+
            "    764                                99 8 8 8 8  8 8 8 8 99                                467    \n"+
            "    5645             9                97 8 8 777 77 777 8 8 79                              5465    \n"+
            "   7645      9                       97 7 877  766667  778 7 79       6                      5467   \n"+
            "   7645                             5 97 77 766      667 77 79 5                             5467   \n"+
            "   564                             9   97 76            67 79   9                             465   \n"+
            "   7645 4                         979   97      4664      79   979             6    4        5467   \n"+
            "  7645                           97 79   5   4666886664   5   97 79                           5467  \n"+
            "  564           4        8      79 7 79   5 667788887766 5   97 7 97                      7    465  \n"+
            "  7645                          9 8 7 75   97788999988779   57 7 8 9       7                  5467  \n"+
            "  764                          798 877  5   98788  88789   5  778 897                          467  \n"+
            "  5645                         9  87 6   9   97      79   9   6 78  9                         5465  \n"+
            " 7645    9                    59 8 77   679 5          5 976   77 8 95                         5467 \n"+
            " 564                          798 7 6  46789            98764  6 7 897            4             465 \n"+
            " 7645            5            98 87 6  67877            77876  6 78 89                     8   5467 \n"+
            " 7645                        59 8 77   6788              8876   77 8 95                        5467 \n"+
            " 564                         798 8 6  46898              89864  6 8 897                         465 \n"+
            " 7645                        79 8 76  6889                9886  67 8 97                        5467 \n"+
            " 7645                        79 8 76  6889                9886  67 8 97                        5467 \n"+
            " 564                   4     798 8 6  46898              89864  6 8 897           9             465 \n"+
            " 7645                        59 8 77   6788              8876   77 8 95                        5467 \n"+
            " 7645  8                      98 87 6  67877            77876  6 78 89                         5467 \n"+
            " 564                          798 7 6  46789            98764  6 7 897                          465 \n"+
            " 7645                         59 8 77   679 5          5 976   77 8 95                 5       5467 \n"+
            "  5645             6           9  87 6   9   97      79   9   6 78  9                         5465  \n"+
            "  764                          798 877  5   98788  88789   5  778 897    5          9          467  \n"+
            "  7645                          9 8 7 75   97788999988779   57 7 8 9          9               5467  \n"+
            "  564                   7       79 7 79   5 667788887766 5   97 7 97                           465  \n"+
            "  7645      6                    97 79   5   4666886664   5   97 79                      6    5467  \n"+
            "   7645                           979   97      4664      79   979                           5467   \n"+
            "   564                             9   97 76            67 79   9                             465   \n"+
            "   7645                             5 97 77 766      667 77 79 5                             5467   \n"+
            "   7645                              97 7 877  766667  778 7 79                              5467   \n"+
            "    5645              6               97 8 8 777 77 777 8 8 79                              5465    \n"+
            "    764                                99 8 8 8 8  8 8 8 8 99                                467    \n"+
            "    7645                                799  8 8 88 8 8  997                     9          5467    \n"+
            "     564                                  79998 8  8 89997           8                      465     \n"+
            "     7645     6                             579999999975             4   8                 5467     \n"+
            "      5645                                     577775                                     5465      \n"+
            "      764                      9                                                           467      \n"+
            "       7645          5                                                            6      5467       \n"+
            "        564                           7                                                  465  8     \n"+
            "    8   7645                                                 9                          5467        \n"+
            "         5645                                                                          5465         \n"+
            "9         764                    6                                                     467          \n"+
            "          7645                                                                        5467          \n"+
            "           5645                              5     8                                 5465        5  \n"+
            "            764                                                                      467            \n"+
            "     8       56                                            6                         65             \n"+
            "                                     9                                     5                        \n"+
            "                                                                   8                                \n"+
            "9                              6         5                                                         9\n"+
            "9                                                                                                  9\n"+
            "99                 645                                                        546                 99\n"+
            "99             7   5645                      7                               5465   6    7        99\n"+
            "99                  76445          7               7                       54467                  99\n"+
            "99                   56645                                                54665                   99\n"+
            "997              6    776445                              4      9      544677             5     799\n"+
            "997                     5664 5                                        5 4665                     799\n"+
            "997                      756445           9                          544657          4           799\n"+
            "997         4 7            766445 5                              5 544667                        799\n"+
            "997                         756644455 5                      5 554446657                         799\n"+
            "99                            7566644445 5 5            5 5 5444466657                            99\n"+
            "99                              7756666444445 55 55 55 5444446666577        9                     99\n"+
            "99                   5   5         775766666444444444444666667577                                 99\n"+
            "99    77777       7                    7577566666666666657757  7       6                 77777    99\n"+
            "999999999999999                             757757757757                             999999999999999\n"+
            "99999999999999999                                66                                99999999999999999"
    },
    {
        name: "Flames",
        author: "Nex",
        spawnpoints: [
            { x: 390, y: -390},
            { x: -390, y: 390 }
        ],
        map:
            "999999999999999999999999999 8  7 7775   55       85 9 889 6 46999  8499  999999999999999999999999999\n"+
            "9999999999999999999999999758579798965   4 789   655 798884696789632133 54445999999999999999999999999\n"+
            "9999999999999979999888 9975 5   8896      7899 658 7     6  8679583 9   647 357999999999999999999999\n"+
            "999999785999995988938788 85 25   469            8  56  25895 459   7      676  9793 8799999999999999\n"+
            "999998558676844699979397 7  8    896    86 8 8  45856  9984  7  958       75  898  78897999999999999\n"+
            "9999994949   8684877 793577798   56    79 9  4  69               9        7  98569789899999999999999\n"+
            "9999776  99998 698977    3 8998                549                     5   479 5487  499999999999999\n"+
            "999964899    998957                 9          7 246          77    86677   24 587  4 96 99999999999\n"+
            "99954779      9  7       9   468  96            7 9246  9        468 8 9   67  8   7 996 99999999999\n"+
            "9999  9        995            9468 5            8       97       8946     88     68   67999999999999\n"+
            "9965 69        9684                        79          8         97      777 99  93   7   9999999999\n"+
            "997 669        977    9                    98               9    9       7       565 7   99999999999\n"+
            "9998449        94        8936 7   6       877               58                   57 8  999  89979999\n"+
            "999    9                   8               9                          9     7935 6    757   79989999\n"+
            "999  7 95                     7         3577     8           97      8             9  7778  99999999\n"+
            "999698 54999                            897     98      5    89      8        77  3         999 9899\n"+
            "99964  5  5                         7                   9            983       7    87    55775 9999\n"+
            "99845  6647                         35                               9 9257      8997     786  99799\n"+
            "99764 85844                                                         9           879    2     9997999\n"+
            "99799988                                           79         8              574      9   479247 799\n"+
            "99797945                    6                        9                               88     88924899\n"+
            "9 88777 35                                                                         94    77848  98 9\n"+
            "9 9 88 88  6                   3              4                                      946         899\n"+
            "99297 898  9469                3              89              6          98           74 8 585   4 9\n"+
            " 48824       9                            8                   94     7  689            5 96  99 44 8\n"+
            "     88                                   3          77             88         5      8  9  98  7 99\n"+
            "      98            6                                                                       7 579889\n"+
            "      36893    6                                         79                      98      9 36 535999\n"+
            "978          897                                  9      35               3      886     9 54 56    \n"+
            "95                    33          6                                       7       88          747   \n"+
            "98359                                                                 8                    257    9 \n"+
            "77778889         35                                 7                                       92579   \n"+
            "99888                                                            3           97                    2\n"+
            "9                     8                        3        7      4            79      469           76\n"+
            "6     645   92                                4   8            3                     94 5    89  777\n"+
            " 9    35    47            43                    4               9      7               36  977988778\n"+
            " 979                      3                                                            56  877 8 898\n"+
            "  867 87         65          8                               4                 68    6   99     9 97\n"+
            "     87 46       63                                                                  9  99     99   \n"+
            "    87  89             36            4                                                              \n"+
            "          9             9            4           8                   4     5     99                 \n"+
            "            3                 3                    3                4      9     99        799   897\n"+
            "98 5893    54                                   9999                              9       9357988789\n"+
            "8888 589   5       7                           999999                                    9    579357\n"+
            "978                              7                                8   79      97                  93\n"+
            " 8    999                  3                                                  7       92   4     7  \n"+
            "39    999     57       7                                                                  5    9777 \n"+
            " 9    999  9  92      88     66            9            9           97                     9 6 9 8  \n"+
            "                             696      3   99            99          8            68             7   \n"+
            "                                          99            99    4                  94                 \n"+
            "89       69       77              4       99            99                             9   9       9\n"+
            "8898  99  4 88    7                      699            99  3      4   6              9887        99\n"+
            "  999 9    79          98            83    9            9                    9        69        8977\n"+
            " 86 98                99                                                     5       89    6  77  79\n"+
            "8 8   468 63        5     4                                                     4   99         997  \n"+
            "6      94 645       93          97  7                            7             44      9    7 9 9 57\n"+
            "      97793                     8              999999                                               \n"+
            "79     99                                       9999                                    579     98  \n"+
            "877935 7   98   9        6                                                               2579 7 94  \n"+
            "7   7   97987   5                                                        9           554346    635  \n"+
            "778    34                                           7                   98         24 6 6  5 8  9  9\n"+
            "99   944                    6        6             43                              69     787     94\n"+
            "  2 784 89724          77    9                     4                                   7 9 9    4 68\n"+
            "25788  9988           6                                                                89      446  \n"+
            "645                   7              4         7                               8               4    \n"+
            "844   89   64  7        9            4                                                    79  5 9   \n"+
            "689   4989 34  9  8            6                                                          8978799  6\n"+
            "899  899 68       9                  4     7             8              3                    3    87\n"+
            "989 97 7               9                            4                  4             6   3   633 788\n"+
            "3736     653                                       4                                 7   7935 6  888\n"+
            "36893689    35   35                                4 4                               7     793579   \n"+
            "47    3689 46         7     8    57                       4                   7               775793\n"+
            "77  87  99             9         93                     7                                     789 57\n"+
            "88 88 689877          87                                                       6         7 8   3 99 \n"+
            "773579664 77  9       89               9           8                                 9   789  56649 \n"+
            "8 799996539   5             79                    66      4    8                    7      7   5 39 \n"+
            "9   9 3  8   4     98                       89    9       4                               54 9     9\n"+
            "9   2   48  36  9  99   6        8           6                                           63   9 9369\n"+
            "9 882   924643 9999             79   9                  7   6                           76     8 899\n"+
            "99646122   2469999    77 4 6        8   8                   9                           98     89999\n"+
            "998  66   99          6      77        936             8                               9     8698999\n"+
            "99868    9999                99                        35            88                    556547999\n"+
            "997499  9999128753 99     6                                 9                             4579969999\n"+
            "999 99 9999762826   9 78           937   89     6           6  87            9           679    9999\n"+
            "999 99799975    5   996    7       577    7     7  3        9  9   897        6         999   969999\n"+
            "99999999767 5768    9989             9             7                         89            999845999\n"+
            "999939987  9766  7999999      7      8                 9              8      78             97454999\n"+
            "99999987 998757 54599999  6   2579          9       9             28654  75         9        9  8999\n"+
            "999998699997    95  599  8      25        966 479  9              8847  777         9        94 7999\n"+
            "999999999975 98 96    7869           47   97   24         9   6  76     64       9869        9849999\n"+
            "9999999999869975     87   2          8575  66            99     7         478   99889        9979999\n"+
            "999999999999997 999 668  499246 6      6  4  9                  94 9774   48 9  9698 9      9 989999\n"+
            "9999999999999 52994  1 99999 92488   9     999    7   8  3      68977 5         964  79    99  59999\n"+
            "99999999999999999999   9 999   997   9 77   994 96   6   89368       76         8    549996   499999\n"+
            "999999999999999499955868       69     685   59  69   6      93689    99              44  78584479999\n"+
            "99999999999999997844  946894 99      584  8   99    5 89        6  999      999      96 679548499999\n"+
            "99999999999999996166996  4   9       995899   99  99  68  7    6   7 99  93589   5659877649999999999\n"+
            "99999999999999999999 99999     99     99  999 99  99  8  3999654  86787 768 365558999999999999999999\n"+
            "9999999999999999999999999   9   999      99999 9119 6789   99688 9986 966 4 999999999999999999999999\n"+
            "9999999999999999999999999999999 7999      9999  44  9978   9  7799997999 999999999999999999999999999"
    },
    {
        name: "Nebula",
        author: "Nex",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 }
        ],
        map:
            "9999999999999999999999999999999999999                          9999999999999999999999999999999999999\n"+
            "99999999999979999999999999999999999999        9         7     99999999999999999999999999999999999999\n"+
            "999999999999999899999999999999999999999                      999979999999999999999999999999999999999\n"+
            "9996789749976859768495999569997999469799             9      9975699974965645648978999664948795999999\n"+
            "99949978584597956565978669998989949466999        9         99949495577789479854545789997578999999999\n"+
            "99994647898 9 8 665456 669  5 788879746                      64549 5668458  869699975 89779    89999\n"+
            "9958964 7     8 4      8 78 6 49 884 96     8        8         74 99546568 7544 8744699944     59999\n"+
            "9999657                 8 83  9 844      7              8       878     98 99 7  9554475 7     99999\n"+
            "9997457              7    75  6  4                7                     84 9  8  87           996999\n"+
            "999874                     556                                          8 59  7  4          75598999\n"+
            "999854                      84                 65          9          49  7                 56794999\n"+
            "999958                      44         5        94                   7                       4865999\n"+
            "99978                        79         88          47                         5       6   477669999\n"+
            "99979                       9 4          6           48                        46     95  87   79999\n"+
            "99986664774                   58         879          4                      88 8    98    948448999\n"+
            "99995        447               6      7797 47                       9       7988    441    986787999\n"+
            "999956798      5862            47    44 8 6 965               5           6698     76         996999\n"+
            "99949 85         4714        9  7 9       8                   9               79              899999\n"+
            "999588            659           5      9     9                                97           785896999\n"+
            "9996966 7           65          4                          88                 7         9     999999\n"+
            "99999 98         5 8 498                                 97                   44            48599999\n"+
            "99995689        7  6  9          6  9                             6          54               979999\n"+
            "99949      79     9   63         8                                4    79        9           5589999\n"+
            "9998784    9      9 5976         64 8  9  9       7              4   495                    54799999\n"+
            "999948975             89 8       289              4            86                          687899999\n"+
            "99954             5   75        945  9   9     9 59            9    46                64485 58899999\n"+
            "99969577            8             5   6                        977 86                       84699999\n"+
            "99999  88              4          94  8 6       85               9899                      56 499999\n"+
            "999754576              84         649 7    9 9 49           9       7         6 6          47 699999\n"+
            "999975 57        5     44          68967                          9 6                      698799999\n"+
            "999969684              83           659  9                         568              9      656899999\n"+
            "999997494              69            7457   9                     7                          6 99999\n"+
            "99988       6           6              695997  9                  6                          6999999\n"+
            "9994665     8           4                   794  6                         95        7695 9797979999\n"+
            "99999 7649  98          6     9              699  7   56                    5       66    48  969999\n"+
            "99997        7          937                   89999  995                    99             77 849999\n"+
            "999969       97        845                      755   4976                  7      7        56589999\n"+
            " 999996       9     9  7 84                                      9         66      8        85 9999 \n"+
            "  999       9 69         69                                                7                 99999  \n"+
            "   99           9        98   8                                            6                   99   \n"+
            "    9                    9  5                                 8           78        8          9    \n"+
            "   9                  7 7  6788                              4            8     97 9             9  \n"+
            "                           89 56966                          5       965          78                \n"+
            "                        7  6   7857759     99          9     6                   88                 \n"+
            "        59    895       7      8  9 9731   9 7        7 9   95                  97         9    8   \n"+
            "        79              5  9     7  8897    7          7    5             4                        9\n"+
            " 9                               6   999                    986                                     \n"+
            "                                    89998                  878             65                       \n"+
            "       9                              788                  68                                       \n"+
            "                            4                                                         96       54   \n"+
            "                             6                                                        8        6    \n"+
            "   64                                                      796                                    9 \n"+
            "    4           7                      9                   497      7       99                      \n"+
            "                 66                   55                    94 7         76                         \n"+
            "    9           8     9              98     7          7    94     6                                \n"+
            "          4     9                     6    9 7        7 9   159             6      9                \n"+
            "  9      97     4                8          9          99     5574          854           954    8  \n"+
            "               78                   9 8                          6  87                      6   976 \n"+
            "               8                                                     654                       9    \n"+
            "    9        89 87         4                                      8    84                      9    \n"+
            "   99        9    85        4                                           94           55        99   \n"+
            "  999 77     6      9        9                   11                      8            9       8499  \n"+
            " 999999     46  996        9  5            8    791                      47      4     8      95999 \n"+
            "999996       66  5            95           59 76995                      85      5            569999\n"+
            "99999469                  9    5                9999                             9     4     9 49999\n"+
            "9999778                      9  8                 785   8             7               6      8549999\n"+
            "99965                            5               9 6   69956                         9477   46499999\n"+
            "9958566                                           5    9976656  8              9     9       6686999\n"+
            "997665                      9         2                9  9 754            8   5           879859999\n"+
            "995787   58        89454              527   9          9    7 96           7 7             476979999\n"+
            "999494    8                          799          9     9      84          7               945899999\n"+
            "99884999          8                    9  5               9  9867         88  9         9  6 7799999\n"+
            "99955476           6                  9977             8       756         97   8            5599999\n"+
            "9998566                              99 9             9       5 97          999            976599999\n"+
            "99999               9               599             8          9 76         8 9              8999999\n"+
            "9999985            48          9     499                   9                8 9              9799999\n"+
            "9859994           97           99   76  4        7994             9         5 5            6 7499999\n"+
            "999494 646                7    5           9 86 5             9  79   9     969    7     6 844799999\n"+
            "99969 7                  99               4           9           9          7          79  96599999\n"+
            "99999579    9             95                                      9          878 9     97  956899999\n"+
            "9995988  8  8                                      9    6        999         55579 67  4   577589999\n"+
            "999896 888 98   9                                                 87         7 87           98 69999\n"+
            "999699799  9                  9                              9     4           4846   7 8   65799999\n"+
            "99997698                                    9  956                 66 9          2567    999 4995999\n"+
            "9999559             7                    7969           9          86              877599   99997999\n"+
            "999747                8            7                                44                56944589499999\n"+
            "99948498 9            77878       9        9                        57                         99999\n"+
            "9995994 8  9      44 97       8   79         9           757      9  75                       779999\n"+
            "999698  9  679  9   99 79 754 97  9     7             487            98                     74459999\n"+
            "999569  9   79       8         97989   9                                7                     649999\n"+
            "999968  98  789    997             9   9                      67       7                    88799999\n"+
            "999995 88    8      9            9 7      7     9           96 86  9   65                 4  6 69999\n"+
            "99999588  7  7 9     85559    679545   8                     9  769977  78   7            8 64649999\n"+
            "9996786879479894 68 88   78  49  468 9                       778869986   54        5  54  746  79999\n"+
            "999979588 798 978 5496    9  66 8  59             9          4978 966957  796 5879544495887684499999\n"+
            "99994699965849869998879799974575565998999 7             7  99995898949789985896548944464868948849999\n"+
            "9999999999999999499999969999999999999999       88     8     9999999999999999999999679996879999999999\n"+
            "999999999999999999999999999999999999999  9        8    7   9 999999999999999999999999999999999999999\n"+
            "99999999999999999999999999999999999999                     7  99999999999999999999999999999999999999\n"+
            "9999999999999999999999999999999999999                          9999999999999999999999999999999999999"
    },
    {
        name: "Blockchain",
        author: "Nex",
        spawnpoints: [
            { x: 390, y: 0},
            { x: -390, y: 0}
        ],
        map:
            "  999999999999999999999999999999999999999999999      99999999999 9 9 9 9 999 99 9 9 99999999999999  \n"+
            "   99999999999999999999999999999999999999999999      99999999999 9 9 9 9   9 99 9 9 9999999999999   \n"+
            "9   9999999999999999999999999999999999999999999      9999999999999999999999999999999999999999999   9\n"+
            "99   999999999999999999999999999999999999999999444444999999999999999999999999999999999999999999   99\n"+
            "999   99999999999999999999999999999999999999999      99999999999999999999999999999999999999999   999\n"+
            "999    999999999999999999999999999999999999999        999999999999999999999999999999999999999    999\n"+
            "999 9  49999999999999999999999999999999999999          99999999999999999999999999999999999994  9 999\n"+
            "9 94994                                                                                      49949 9\n"+
            "999 999       99999 99999 99999 99999 99999              99999 99999 99999 99999 99999       999 999\n"+
            "9 9 9999       999   999   999   999   999                999   999   999   999   999       9999 9 9\n"+
            "999 9999        9     9     9     9     9                  9     9     9     9     9        9999 999\n"+
            "9 9 9999                                                                                    9999 9 9\n"+
            "999 9999           9   9                                                    9   9           9999 999\n"+
            "9 9 9999 9                        9   9   9   9      9   9   9   9                        9 9999 9 9\n"+
            "999 9999 99                                                                              99 9999 999\n"+
            "9 9 9999 999      9 4 9 4 9         4       4          4       4         9 4 9 4 9      999 9999 9 9\n"+
            "999 9999 999                                                                            999 9999 999\n"+
            "9 9 9999 99                       9   9   9   9      9   9   9   9                       99 9999 9 9\n"+
            "999 9999 9           9 4 9 4 9                                        9 4 9 4 9           9 9999 999\n"+
            "9 9 9999                            4       4          4       4                            9999 9 9\n"+
            "999 9999                                                                                    9999 999\n"+
            "9 9 9999                9   9     9   9   9   9      9   9   9   9     9   9                9999 9 9\n"+
            "999 9999                                                                                    9999 999\n"+
            "9 9 999              9   9   9     9   9   9   9    9   9   9   9     9   9   9              999 9 9\n"+
            "999 99  9           999 999 999    99 999 999 99    99 999 999 99    999 999 999           9  99 999\n"+
            "9 9 9  99          9999999999999   9979999999999    9999999999799   9999999999999          99  9 9 9\n"+
            "999   999          99999999999994449999999999999    99999999999994449999999999999          999   999\n"+
            "9 9  9999          99 999 999 99   999999999999944449999999999999   99 999 999 99          9999  9 9\n"+
            "999                9   9   9   9   9999999999999    9999999999999   9   9   9   9                999\n"+
            "9 9                                 999 997 999      999 799 999                                 9 9\n"+
            "999 9            9   9   9   9   9   9   9   9        9   9   9   9   9   9   9   9            9 999\n"+
            "9 9 99              4   4   4   4                                  4   4   4   4              99 9 9\n"+
            "999 999           4   4   4   4                                      4   4   4   4           999 999\n"+
            "9 9 99           9   9   9   9   9                                9   9   9   9   9           99 9 9\n"+
            "999 9                                                                                          9 999\n"+
            "9 9                4       4                                            4       4                9 9\n"+
            "999                                                                                              999\n"+
            "9 9 9            9   9   9   9       9999                  9999       9   9   9   9            9 9 9\n"+
            "999 99                               999999994        499999999                               99 999\n"+
            "999 999            4       4         999                    999         4       4            999 999\n"+
            "999 99                               99                      99                               99 999\n"+
            "999 9            9   9   9   9        9  99994        49999  9        9   9   9   9            9 999\n"+
            "999                                   9  9                9  9                                   999\n"+
            "999                                   9  9                9  9                                   999\n"+
            "999 9                                 9  9   994    499   9  9                                 9 999\n"+
            "999 99                                4  4  99        99  4  4                                99 999\n"+
            "999 999                                     9          9                                     999 999\n"+
            "999 99                                      4          4                                      99 999\n"+
            "999 9                                                                                          9 999\n"+
            "999                                                                                              999\n"+
            "999                                                                                              999\n"+
            "999 9                                                                                          9 999\n"+
            "999 99                                      4          4                                      99 999\n"+
            "999 999                                     9          9                                     999 999\n"+
            "999 99                                4  4  99        99  4  4                                99 999\n"+
            "999 9                                 9  9   994    499   9  9                                 9 999\n"+
            "999                                   9  9                9  9                                   999\n"+
            "999                                   9  9                9  9                                   999\n"+
            "999 9            9   9   9   9        9  99994        49999  9        9   9   9   9            9 999\n"+
            "999 99                               99                      99                               99 999\n"+
            "999 999            4       4         999                    999         4       4            999 999\n"+
            "999 99                               999999994        499999999                               99 999\n"+
            "9 9 9            9   9   9   9       9999                  9999       9   9   9   9            9 9 9\n"+
            "999                                                                                              999\n"+
            "9 9                4       4                                            4       4                9 9\n"+
            "999 9                                                                                          9 999\n"+
            "9 9 99           9   9   9   9   9                                9   9   9   9   9           99 9 9\n"+
            "999 999           4   4   4   4                                      4   4   4   4           999 999\n"+
            "9 9 99              4   4   4   4                                  4   4   4   4              99 9 9\n"+
            "999 9            9   9   9   9   9   9   9   9        9   9   9   9   9   9   9   9            9 999\n"+
            "9 9                                 999 997 999      999 799 999                                 9 9\n"+
            "999                9   9   9   9   9999999999999    9999999999999   9   9   9   9                999\n"+
            "9 9  9999          99 999 999 99   999999999999944449999999999999   99 999 999 99          9999  9 9\n"+
            "999   999          99999999999994449999999999999    99999999999994449999999999999          999   999\n"+
            "9 9 9  99          9999999999999   9979999999999    9999999999799   9999999999999          99  9 9 9\n"+
            "999 99  9           999 999 999    99 999 999 99    99 999 999 99    999 999 999           9  99 999\n"+
            "9 9 999              9   9   9     9   9   9   9    9   9   9   9     9   9   9              999 9 9\n"+
            "999 9999                                                                                    9999 999\n"+
            "9 9 9999                9   9     9   9   9   9      9   9   9   9     9   9                9999 9 9\n"+
            "999 9999                                                                                    9999 999\n"+
            "9 9 9999                            4       4          4       4                            9999 9 9\n"+
            "999 9999 9           9 4 9 4 9                                        9 4 9 4 9           9 9999 999\n"+
            "9 9 9999 99                       9   9   9   9      9   9   9   9                       99 9999 9 9\n"+
            "999 9999 999                                                                            999 9999 999\n"+
            "9 9 9999 999      9 4 9 4 9         4       4          4       4         9 4 9 4 9      999 9999 9 9\n"+
            "999 9999 99                                                                              99 9999 999\n"+
            "9 9 9999 9                        9   9   9   9      9   9   9   9                        9 9999 9 9\n"+
            "999 9999           9   9                                                    9   9           9999 999\n"+
            "9 9 9999                                                                                    9999 9 9\n"+
            "999 9999        9     9     9     9     9                  9     9     9     9     9        9999 999\n"+
            "9 9 9999       999   999   999   999   999                999   999   999   999   999       9999 9 9\n"+
            "999 999       99999 99999 99999 99999 99999              99999 99999 99999 99999 99999       999 999\n"+
            "9 94994                                                                                      49949 9\n"+
            "999 9  49999999999999999999999999999999999999          99999999999999999999999999999999999994  9 999\n"+
            "999    999999999999999999999999999999999999999        999999999999999999999999999999999999999    999\n"+
            "999   99999999999999999999999999999999999999999      99999999999999999999999999999999999999999   999\n"+
            "99   999999999999999999999999999999999999999999444444999999999999999999999999999999999999999999   99\n"+
            "9   9999999999999999999999999999999999999999999      999999999999 99  99   9 99 99 9999999999999   9\n"+
            "   99999999999999999999999999999999999999999999      99999999999 9 9 9 9 999  9 9 9 9999999999999   \n"+
            "  999999999999999999999999999999999999999999999      99999999999   9  99   9 9  9   99999999999999  "
    },
    {
        name: "Spiral",
        author: "Caramel",
        spawnpoints: [
            { x: 390, y: 0 },
            { x: -390, y: 0 },
            { x: 0, y: 390 },
            { x: 0, y: -390 }
        ],
        pairings: [
            [0, 1],
            [2, 3]
        ],
        map:
            " 2 21  3331 411 414344  332    322 142    5555554554555555    241 223344133 2 1 2414 114 422 234 1  \n"+
            "13 423 32331  2     3 33  4 31 33  5 75545455574677647555454557 5  3341111  3 2  2   2 4 2 23 21424 \n"+
            " 11 3    1112   414 2 12 214  2455444448667766788778876677668444445542  1 44 233  11  3 3 44 23 4   \n"+
            "  23 1214  13  3 2    4 2   13444445677767777999977999977776777654444431   2 3 2  2 3    2 4  33   2\n"+
            "412       1331  41    41 4 1544444767677899888998888998889987767674444451 4342  2 12     2  11 14 44\n"+
            " 442 23314 14421 11143 131154555667789899898            898998987766555451131   131   44  443    14 \n"+
            "  11 2 13 33  3  122  2  44454576678989                      98987667545444  2 4 2 1 34   13 1  3  3\n"+
            "424 13 41  242  1   3  6554766798698                            8968976674556  32  11 2 22  443 4423\n"+
            "    42  3  4   2132 2 546776798889     6   3            3   6     988897677645 1 43 2   4 4   212   \n"+
            "1 11 4 3 33 321 342 545567698998                                    899896765545 223 132233 4 4  4  \n"+
            "313    32  1      36457768899      5                            5      9988677546     1    2311    4\n"+
            "   4 1    32  242 6446767899       4  3                      3  4       9987676446 3    23   31    4\n"+
            "       1 44 4  3 644556899                4              4                998655446 1  4    11 12   \n"+
            "214    3 2  234 544557999    3                                        3    999755445 432  2 2  43  2\n"+
            "31     3     26545657896             15                      51             69875654562   1 2  4 313\n"+
            "2234   43 14  454565789   5         423  3                3  324         5   987565454  4143   44244\n"+
            "2 22  4 3 2 64556767789  4   6   3                                3   6   4  98776765546 2  34   3 2\n"+
            "1         4 45446666896                       6      6                       69866664454 4    1    1\n"+
            "2142 1  43 455665668893  3                                                3  398866566554 34    1432\n"+
            " 2     21 5444577877895         12113     3              3     31121         5987787754445 12 1   2 \n"+
            "143 4 12255545877888899      255442    42        33        24    244552      99888877854555221 1 241\n"+
            " 1 2 12 6445676889999994   476643                                  346674   49999998867654462212 34 \n"+
            " 121 4115446678896359999 588863              12      21              368885 9999536988766445114 3 14\n"+
            "43 2 1 44466789      499988886    4          25      52          4    688889994      98766444 112  3\n"+
            " 2 1 3555556998        897742        3  4    1        1    4  3        247798        8996555553 1 2 \n"+
            "1 422 45567689        588776655                                      556677885        98676554 22 31\n"+
            "1  3 54466689    3    88777665552                44                25556677788    3    98666445 3 1 \n"+
            "   3444657999        488466    44      6                    6      44    664884        9997564443 1 \n"+
            "4 3155465799         787266     3                                  3     662787         9975645513 4\n"+
            " 31 5465679         2666 55  3     3                            3     3  55 6662         9765645 13 \n"+
            "21355565899   5     563  55      5         5 122        5         5      55  365     5   9985655531 \n"+
            "1314455689     6    55    54     4            3333   3            4     45    55    6     9865544131\n"+
            "4115466689         143    243                   433                    342    341         986664511 \n"+
            "1344667899         24                     35     343    53                     42         9987664431\n"+
            "118456798          12          3     6            343         6     3          21          897654811\n"+
            "116457789     3    1                               442                          1    3     987754611\n"+
            "1 745688                6                          444                     6                886547 1\n"+
            "4 545799                    4 5   5     3 12       3554    3     5   5 4                    997545 4\n"+
            "36556699                     45   3    144432      2565          3   54                     99665563\n"+
            "4555678         3            3           25565      675      1        3            3         8765554\n"+
            "3746689       6 4 2   3                    5678     7761     4               3   2 4 6       9866473\n"+
            "1565579  3      553  5    3                 5887    8983    241          3    5  355      3  9755651\n"+
            "5465699         22            54    6        85      594    5426    45            22         9965645\n"+
            "4545789                                                    553                               9875454\n"+
            "555768              4                   134               5662                 4              867555\n"+
            "454588                               455689              8875                                 885454\n"+
            "446599                     6       24567795              588        1   6                     995644\n"+
            "555589           4                34555678                7        22             4           985555\n"+
            "545788                 6         344432                            42       6                 887545\n"+
            "455778                      3   343                               33   3                      877554\n"+
            "455778                      3  333                               343   3                      877554\n"+
            "545788                 6       34                            234443         6                 887545\n"+
            "555589           4            23         7                87655543                4           985555\n"+
            "446599                     6  22        885              59776542       6                     995644\n"+
            "454588                        1        5788              986554                               885454\n"+
            "555768              4                 2665               431                   4              867555\n"+
            "4545789                              2355                                                    9875454\n"+
            "5465699         22            54    6145    495      58        6    45            22         9965645\n"+
            "1565579  3      553  5    3           42    3898    7885                 3    5  355      3  9755651\n"+
            "3746689       6 4 2   3               4     1677     8765                    3   2 4 6       9866473\n"+
            "4555678         3            3        1      576      56552           3            3         8765554\n"+
            "36556699                     45   3          5652      234341    3   54                     99665563\n"+
            "4 545799                    4 5   5     3    4553       21 3     5   5 4                    997545 4\n"+
            "1 745688                6                     454                          6                886547 1\n"+
            "316457789     3    1                          244                               1    3     987754631\n"+
            "118456798          12          3     6         343            6     3          21          897654811\n"+
            "1344667899         24                     35    343     53                     42         9987664441\n"+
            " 1 5466689         143    243                    334                   342    341         9866645112\n"+
            "1314455689     6    55    54     4            3   3333            4     45    55    6     9865544131\n"+
            "21155565899   5     563  55      5         5        221 5         5      55  365     5   998565553 3\n"+
            "  1 5465679         2666 55  3     3                            3     3  55 6662         9765645 1  \n"+
            "123155465799         787266     3                                  3     662787         99756455132 \n"+
            "1  3444657999        488466    44      6                    6      44    664884        999756444321 \n"+
            "112  54466689    3    88777665552                44                25556677788    3    98666445 3 21\n"+
            "2 312 45567689        588776655                                      556677885        98676554 21 31\n"+
            " 3 2 3555556998        897742        3  4    1        1    4  3        247798        899655555311322\n"+
            "32  11 44466789      499988886    4          25      52          4    688889994      98766444       \n"+
            "3 12 4115446678896359999 588863              12      21              368885 99995369887664451144 114\n"+
            " 1242 226445676889999994   476643                                  346674   499999988676544622    1 \n"+
            " 2  3 12255545877888899      255442    42        33        24    244552      99888877854555221213241\n"+
            "  2  1 21 5444577877895         12113     3              3     31121         5987787754445 12   122 \n"+
            "2 4     43 455665668893  3                                                3  398866566554 34 21 1 33\n"+
            "11 133    4 45446666896                       6      6                       69866664454 4    13   1\n"+
            "2232 141    64556767789  4   6   3                                3   6   4  98776765546 2 31 11 1 4\n"+
            "4   114 3 14  454565789   5         423  3                3  324         5   987565454  41413 24 32 \n"+
            "3 11    33   26545657896             15                      51             69875654562   1 1 241224\n"+
            "2  34 22    234 544557999    3                                        3    999755445 4321  4       1\n"+
            " 1  2 21322 1  1 644556899                4              4                998655446 1 342 1 13  4422\n"+
            "4 2      332  24  6446767899       4  3                      3  4       9987676446 3421 2     12 412\n"+
            " 31211132 1   1    6457768899      5                            5      9988677546    112 33 33 2 3 4\n"+
            "  4  1   3 2121 322 545567698998                                    899896765545 2  13322  14 432  2\n"+
            "34 3132      441 14 1 546776798889     6   3            3   6     988897677645 1 4 11   2 4 1  1    \n"+
            "  2    44 2  2 11  23  6554766798698                            8968976674556  32 2  323    4   4323\n"+
            "23 211213  4 4  42  4 2  44454576678989                      98987667545444  2 33131 3  21131144 2 1\n"+
            "3231 23  1 3 4 1 23 41 131154555667789899898            8989989877665554511314 3131  33 3 4 3 4 2 4 \n"+
            " 114 3  34  41  22 24  434 1544444767677899888998888998889987767674444451312 23 2232 34 22  112 4 44\n"+
            "3111 4  33     122 41  3    1344444567776777799997799997777677765444443 341143    2 32  22 443333   \n"+
            "3111     133   31   1  1 4 1  2455444448667766788778876677668444445542 3143 2 33 223  3   4   3 43  \n"+
            "  141   22    3  12  2 31  1    3  5 75545455574677647555454557 5  3341112  3 1  2 1 1 1 24 3 2 424 \n"+
            "  132 1  34 314  123 1 12 11443  2 142    5555554554555555    241 223 4 143 2 322414 144 422 234    "
    },
    {
        name: "Bullseye",
        author: "Supernova",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 },
            { x: 390, y: 390 },
            { x: -390, y: -390 }
        ],
        pairings: [
            [0, 1],
            [2, 3]
        ],
        map:
            "6969696969696966696969696969696969696966996969        9696996696969696969696969696966696969696969696\n"+
            "9363636363636363636363636363636363636363636369        9636363636363636363636363636363636363636363639\n"+
            "6669696969696969696969696969696969696969696969        9696969696969696969696969696969696969696969666\n"+
            "9393636363636363636363636363636363636363636369        9636363636363636363636363636363636363636363939\n"+
            "6666696969696969696969696969696969696969696969        9696969696969696969696969696969696969696966666\n"+
            "93939                                                                                          93939\n"+
            "66666                                                                                          66666\n"+
            "93939                           3                                  3                           93939\n"+
            "66666                                                                           5      3   5   66666\n"+
            "93939                                                                     3                    93939\n"+
            "66666                                   5     3      3     5                                   66666\n"+
            "93939                            5                                5                            93939\n"+
            "66666                                                                            3             66666\n"+
            "93939                                                                                          93939\n"+
            "66666                                      5            5                                      66666\n"+
            "93939                                                                                          93939\n"+
            "66666                                          999999                                      3   66666\n"+
            "93939                 5                        999999                        5                 93939\n"+
            "66666                               5     3    999999    3     5                               66666\n"+
            "63939                                          999999                                          93936\n"+
            "96666                                        9 999999 9                                        66669\n"+
            "93939           3           5            99999 899998 99999            5           3           93939\n"+
            "66666                                 99996669 799997 96669999                                 66666\n"+
            "93939                               9996666449  9999  9446666999                               93939\n"+
            "66666                             9996664444699 9999 9964444666999                             66666\n"+
            "93939                           997666446666699 9999 996666644666799                           93939\n"+
            "66666     3                      9964446699999  7997  9999966444699                      3     66666\n"+
            "93939            5    3           9966699       5885       9966699           3    5            93939\n"+
            "66666                              99999         77         99999                              66666\n"+
            "93939                               99           66           99                               93939\n"+
            "66666                                            55                                            66666\n"+
            "93939              3                                                            3              93939\n"+
            "66666   5                9                                                9                5   66666\n"+
            "93939          5         99                                              99         5          93939\n"+
            "66666                   9999                                            9999                   66666\n"+
            "93939                   96499                                          99469                   93939\n"+
            "66666                  9964699                   44                   9964699                  66666\n"+
            "93939                  9644699                   55                   9964469                  93939\n"+
            "66966            5    9964669                    66                    9664699    5            66966\n"+
            "93939                 9644699                   7777                   9964469                 93939\n"+
            "66666                 964469                    8778                    964469                 66666\n"+
            "93939         5      9964469                   788887                   9644699      5         93939\n"+
            "66666                964469                    999999                    964469                66666\n"+
            "93939                964469                                              964469                93939\n"+
            "66666                964669                                              966469                66666\n"+
            "99999       3       9999999                                              9999999       3       99999\n"+
            "                        99                                                99                        \n"+
            "                 999987                  79              97                  789999                 \n"+
            "                 99999999875           7889              9887           57899999999                 \n"+
            "                 99999999998765     4567789              9877654     56789999999999                 \n"+
            "                 99999999998765     4567789              9877654     56789999999999                 \n"+
            "                 99999999875           7889              9887           57899999999                 \n"+
            "                 999987                  79              97                  789999                 \n"+
            "                        99                                                99                        \n"+
            "99999       3       9999999                                              9999999       3       99999\n"+
            "66666                964669                                              966469                66666\n"+
            "93939                964469                                              964469                93939\n"+
            "66666                964469                    999999                    964469                66666\n"+
            "93939         5      9964469                   788887                   9644699      5         93939\n"+
            "66666                 964469                    8778                    964469                 66666\n"+
            "93939                 9644699                   7777                   9964469                 93939\n"+
            "66966            5    9964669                    66                    9664699    5            66966\n"+
            "93939                  9644699                   55                   9964469                  93939\n"+
            "66666                  9964699                   44                   9964699                  66666\n"+
            "93939                   96499                                          99469                   93939\n"+
            "66666                   9999                                            9999                   66666\n"+
            "93939          5         99                                              99         5          93939\n"+
            "66666   5                9                                                9                5   66666\n"+
            "93939              3                                                            3              93939\n"+
            "66666                                            55                                            66666\n"+
            "93939                               99           66           99                               93939\n"+
            "66666                              99999         77         99999                              66666\n"+
            "93939            5    3           9966699       5885       9966699           3    5            93939\n"+
            "66666     3                      9964446699999  7997  9999966444699                      3     66666\n"+
            "93939                           997666446666699 9999 996666644666799                           93939\n"+
            "66666                             9996664444699 9999 9964444666999                             66666\n"+
            "93939                               9996666449  9999  9446666999                               93939\n"+
            "66666                                 99996669 799997 96669999                                 66666\n"+
            "93939           3           5            99999 899998 99999            5           3           93939\n"+
            "96666                                        9 999999 9                                        66669\n"+
            "63939                                          999999                                          93936\n"+
            "66666                               5     3    999999    3     5                               66666\n"+
            "93939                 5                        999999                        5                 93939\n"+
            "66666   3                                      999999                                          66666\n"+
            "93939                                                                                          93939\n"+
            "66666                                      5            5                                      66666\n"+
            "93939                                                                                          93939\n"+
            "66666             3                                                                            66666\n"+
            "93939                            5                                5                            93939\n"+
            "66666                                   5     3      3     5                                   66666\n"+
            "93939                    3                                                                     93939\n"+
            "66666   5   3      5                                                                           66666\n"+
            "93939                           3                                  3                           93939\n"+
            "66666                                                                                          66666\n"+
            "93939                                                                                          93939\n"+
            "6666696969696969696969696969696969696969696969        9696969696969696969696969696969696969696966666\n"+
            "9393636363636363636363636363636363636363636369        9636363636363636363636363636363636363636363939\n"+
            "6669696969696969696969696969696969696969696969        9696969696969696969696969696969696969696969666\n"+
            "9363636363636363636363636363636363636363636369        9636363636363636363636363636363636363636363639\n"+
            "6969696969696966696969696969696969696966996969        9696996696969696969696969696966696969696969696"
    },
    {
        name: "Vortex",
        author: "Caramel",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 }
        ],
        map:
            "8678668696666776668587665575755775685558775585876666785855778555865775575755667858666776666968668768\n"+
            "5676788966885756768688756578867857655887767677778558777767677885567587688756578868676575886698876765\n"+
            "6899886788668867876767755778656885687668555756667667666575558666865886568775577676787688668876889986\n"+
            "66676866            9999                                                    9999            66867666\n"+
            "6688698             9996                                                    6999             8968866\n"+
            "879867              888                                                      888              768978\n"+
            "65887               888                                                      888               78856\n"+
            "6979               6776                                                      6776               9796\n"+
            "695                777           66          6666666666          66           777                596\n"+
            "687               5666          6996        699999999996        6996          6665               786\n"+
            "667               666           6996        699999999996        6996           666               766\n"+
            "756              555             66          6666666666          66             555              657\n"+
            "765              45                                                              54              567\n"+
            "755                                                                                              557\n"+
            "766                                                                                              667\n"+
            "786                                          444333333                                           687\n"+
            "567                                         4444444                                              765\n"+
            "578        54                              554454                                      45        875\n"+
            "588       655                              5555                                        556       885\n"+
            "775    57665                              5555                                          56676    577\n"+
            "77799987766                               666                                            66778999777\n"+
            "7899988776                               666                                              6778899987\n"+
            "55999887                                 66                                                 78899955\n"+
            "56696                                   77                                                     69665\n"+
            "578                                     77                                                       875\n"+
            "885                                     7                                                        588\n"+
            "876                                    68                                                        678\n"+
            "556                                    86                                                        655\n"+
            "857                                    8                 332                                     758\n"+
            "876                                    9               33332                                     678\n"+
            "966      56                            9             4443332                             65      669\n"+
            "776     6996                           6            44443332                            6996     677\n"+
            "958     6996                                       544443332                            6996     859\n"+
            "788      56                                       4554443332                             65      887\n"+
            "766                                               655544333                                      667\n"+
            "856                                              5666543                                         658\n"+
            "878                                              86764                                           878\n"+
            "658                                             4876                                             856\n"+
            "867                                             787                                              768\n"+
            "668                         222222              88                  699886                       866\n"+
            "988                         3333333             86                      68777                    889\n"+
            "967                         3333333             9                          7766                  769\n"+
            "956                          333333             7                            6665                659\n"+
            "587                          3434443                                          66555              785\n"+
            "686      66                   444444                                           65554     66      686\n"+
            "686     6996                  4544553                                           65444   6996     686\n"+
            "775     6996                   555565                                            5444   6996     577\n"+
            "755     6996   3                555676                                            544   6996     557\n"+
            "878     6996   3                 466677                  798874                   443   6996     878\n"+
            "585     6996   3                   577886                  688775                  43   6996     585\n"+
            "585     6996   34                    478897                  776664                43   6996     585\n"+
            "878     6996   34                                             676555                3   6996     878\n"+
            "755     6996   344                                             565544               3   6996     557\n"+
            "775     6996   3445                                            4554444              3   6996     577\n"+
            "686     6996   34455                                            444444                  6996     686\n"+
            "686      66     44455                                           3444344                  66      686\n"+
            "587              45555                                           333334                          785\n"+
            "956                6667                            7             3333333                         659\n"+
            "967                  6677                          9             3333333                         769\n"+
            "988                    77886                      68              222222                         889\n"+
            "668                       689996                  88                                             866\n"+
            "867                                              787                                             768\n"+
            "658                                             6774                                             856\n"+
            "878                                           45767                                              878\n"+
            "856                                         3456665                                              658\n"+
            "766                                      333445555                                               667\n"+
            "788      56                             2333444554                                       65      887\n"+
            "958     6996                            233344445                                       6996     859\n"+
            "776     6996                            23334444            6                           6996     677\n"+
            "966      56                             2333444             9                            65      669\n"+
            "876                                     23333               9                                    678\n"+
            "857                                     233                68                                    758\n"+
            "556                                                        86                                    655\n"+
            "876                                                        8                                     678\n"+
            "885                                                        7                                     588\n"+
            "578                                                       77                                     875\n"+
            "56696                                                     77                                   69665\n"+
            "55999887                                                 66                                 78899955\n"+
            "7899988776                                              666                               6778899987\n"+
            "77799987766                                            666                               66778999777\n"+
            "775     7665                                          5555                              5667     577\n"+
            "588       655                                        5555                              556       885\n"+
            "578        54                                      454455                              45        875\n"+
            "567                                              4444444                                         765\n"+
            "786                                           333333444                                          687\n"+
            "766                                                                                              667\n"+
            "755                                                                                              557\n"+
            "765              45                                                              54              567\n"+
            "756              555             66          6666666666          66             555              657\n"+
            "667               666           6996        699999999996        6996           666               766\n"+
            "687               5666          6996        699999999996        6996          6665               786\n"+
            "695                777           66          6666666666          66           777                596\n"+
            "6979               6776                                                      6776               9796\n"+
            "65887               888                                                      888               78856\n"+
            "879867              888                                                      888              768978\n"+
            "6688698             9996                                                    6999             8968866\n"+
            "66676866            9999                                                    9999            66867666\n"+
            "6899886788668867876767755778656885686668555756667667666575558666865886568775577676787688668876889986\n"+
            "5676788966885756768688756578867857655887767677778558777767677885567587688756578868676575886698876765\n"+
            "8678668696666776668587665575755775685558775585876666785855778555865775575755667858666776666968668768"
    },
    {
        name: "Genesis",
        author: "Caramel",
        spawnpoints: [
            { x: 390, y: 0},
            { x: -390, y: 0}
        ],
        map:
            "                        5555555555555555555555555555555555555555555555555555                        \n"+
            "                       555777777777777777777777777777777777777777777777777555                       \n"+
            "     999999999999     55577777777777777777777777777777777777777777777777777555     999999999999     \n"+
            "      9777777779     5557779999999999999999999999999999999999999999999999777555     9777777779      \n"+
            "       97555579     5557779                                              9777555     97555579       \n"+
            "  9     975579     5557779                                                9777555     975579     9  \n"+
            "  99     9779     5557779                                                  9777555     9779     99  \n"+
            "  979     99     5557779                                                    9777555     99     979  \n"+
            "  9779          5557779                                                      9777555          9779  \n"+
            "  97579        5557779                                                        9777555        97579  \n"+
            "  975579      5557779                                                          9777555      975579  \n"+
            "  975579     5557779                                                            9777555     975579  \n"+
            "  97579     5557779                                                              9777555     97579  \n"+
            "  9779     5557779                                                                9777555     9779  \n"+
            "  979     5557779          99999                                    99999          9777555     979  \n"+
            "  99     5557779          977779                                    977779          9777555     99  \n"+
            "  9     5557779          9775579                                    9755779          9777555     9  \n"+
            "       5557779          97755579                                    97555779          9777555       \n"+
            "      5557779          977555779                                    977555779          9777555      \n"+
            "     5557779          977555779                                      977555779          9777555     \n"+
            "    5557779          975555779                                        977555579          9777555    \n"+
            "   5557779          977555779                                          977555779          9777555   \n"+
            "  5557779          977555779                                            977555779          9777555  \n"+
            " 5557779          777555779           999999999      999999999           977555777          9777555 \n"+
            "5557779          977555779           9666666669      9666666669           977555779          9777555\n"+
            "557778          977555779           96644444469      96444444669           977555779          877755\n"+
            "57779          977555779           966446666669      966666644669           977555779          97775\n"+
            "5779           97555779           9664469999999      9999999644669           97755579           9775\n"+
            "5779           9755779           9664669                    9664669           9775579           9775\n"+
            "5779           977779             96669                      96669             977779           9775\n"+
            "5779           99999               969                        969               99999           9775\n"+
            "5779                                9                          9                                9775\n"+
            "5779                         9                                        9                         9775\n"+
            "5779                        979                                      979                        9775\n"+
            "5779                       97679                                    97679                       9775\n"+
            "5779                      9774679                                  9764779                      9775\n"+
            "5768                     9774669                                    9664779                     8675\n"+
            "5778                    9774669                                      9664779                    8775\n"+
            "5779                   9774669             99999    99999             9664779                   9775\n"+
            "5779                   974669             955559    955559             966479                   9775\n"+
            "5779                   97479               95559    95559               97479                   9775\n"+
            "5779                   97479                9999    9999                97479                   9775\n"+
            "5779                   98479           9                    9           97489                   9775\n"+
            "5779                   98479          959                  959          97489                   9775\n"+
            "5779                   98479          9559                9559          97489                   9775\n"+
            "5779                   97779          9559                9559          97779                   9775\n"+
            "5779                   99999          9559                9559          99999                   9775\n"+
            "5779                                  9999                9999                                  9775\n"+
            "5779                                                                                            9775\n"+
            "5779                                                                                            9775\n"+
            "5779                                                                                            9775\n"+
            "5779                                                                                            9775\n"+
            "5779                                  9999                9999                                  9775\n"+
            "5779                   99999          9559                9559          99999                   9775\n"+
            "5779                   97779          9559                9559          97779                   9775\n"+
            "5779                   98479          9559                9559          97489                   9775\n"+
            "5779                   98479          959                  959          97489                   9775\n"+
            "5779                   98479           9                    9           97489                   9775\n"+
            "5779                   97479                9999    9999                97479                   9775\n"+
            "5779                   97479               95559    95559               97479                   9775\n"+
            "5779                   974669             955559    955559             966479                   9775\n"+
            "5779                   9774669             99999    99999             9664779                   9775\n"+
            "5778                    9774669                                      9664779                    8775\n"+
            "5768                     9774669                                    9664779                     8675\n"+
            "5779                      9774679                                  9764779                      9775\n"+
            "5779                       97679                                    97679                       9775\n"+
            "5779                        979                                      979                        9775\n"+
            "5779                         9                                        9                         9775\n"+
            "5779                                9                          9                                9775\n"+
            "5779           99999               969                        969               99999           9775\n"+
            "5779           977779             96669                      96669             977779           9775\n"+
            "5779           9755779           9664669                    9664669           9775579           9775\n"+
            "5779           97555779           9664469999999      9999999644669           97755579           9775\n"+
            "57779          977555779           966446666669      966666644669           977555779          97775\n"+
            "557778          977555779           96644444469      96444444669           977555779          877755\n"+
            "5557779          977555779           9666666669      9666666669           977555779          9777555\n"+
            " 5557779          777555779           999999999      999999999           977555777          9777555 \n"+
            "  5557779          977555779                                            977555779          9777555  \n"+
            "   5557779          977555779                                          977555779          9777555   \n"+
            "    5557779          975555779                                        977555579          9777555    \n"+
            "     5557779          977555779                                      977555779          9777555     \n"+
            "      5557779          977555779                                    977555779          9777555      \n"+
            "       5557779          97755579                                    97555779          9777555       \n"+
            "  9     5557779          9775579                                    9755779          9777555     9  \n"+
            "  99     5557779          977779                                    977779          9777555     99  \n"+
            "  979     5557779          99999                                    99999          9777555     979  \n"+
            "  9779     5557779                                                                9777555     9779  \n"+
            "  97579     5557779                                                              9777555     97579  \n"+
            "  975579     5557779                                                            9777555     975579  \n"+
            "  975579      5557779                                                          9777555      975579  \n"+
            "  97579        5557779                                                        9777555        97579  \n"+
            "  9779          5557779                                                      9777555          9779  \n"+
            "  979     99     5557779                                                    9777555     99     979  \n"+
            "  99     9779     5557779                                                  9777555     9779     99  \n"+
            "  9     975579     5557779                                                9777555     975579     9  \n"+
            "       97555579     5557779                                              9777555     97555579       \n"+
            "      9777777779     5557779999999999999999999999999999999999999999999999777555     9777777779      \n"+
            "     999999999999     55577777777777777777777777777777777777777777777777777555     999999999999     \n"+
            "                       555777777777777777777777777777777777777777777777777555                       \n"+
            "                        5555555555555555555555555555555555555555555555555555                        "
    },
    {
        name: "Deathwings",
        author: "Nerd69420",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 },
            { x: 390, y: 390 },
            { x: -390, y: -390 }
        ],
        pairings: [
            [0, 1],
            [2, 3]
        ],
        map:
            "66695566687666965778677969966656679976857859585      58595875867997665666996977687756966678666559666\n"+
            "66695967687669965778679869967656679976857859585      58595875867997665676996897687756996678676959666\n"+
            "66695967687669965778679869967656679976857859585      58595875867997665676996897687756996678676959666\n"+
            "66695867687669965778679869967656679976857859585      58595875867997665676996897687756996678676859666\n"+
            "9999                            679976                        679976                            9999\n"+
            "8888                            679976                        679976                            8888\n"+
            "7777               5             7997                          7997                             7777\n"+
            "8888                       5     7997      5           3       7997              3              8888\n"+
            "7777                  3          7997           9999           7997       9999                  7777\n"+
            "6666                93            99            9999        5   99     5  9999                  6666\n"+
            "7777                 57           99            9999            99        9999                  7777\n"+
            "8888                              99       3   999999   3       99        99999                 8888\n"+
            "7777                      3     5 99           999999           99         9999     5           7777\n"+
            "6666                                           999999                      9999                 6666\n"+
            "7777               3                3         89999998              3      99999                7777\n"+
            "8888                                    5     88999988                      99999               8888\n"+
            "8888      3                                  8888  8888     5   3           9999                8888\n"+
            "6666                      5                  8888  8888                      99                 6666\n"+
            "6666   5      5                             8888    8888                     9              5   6666\n"+
            "9999                3                      7888      8887              3            9           9999\n"+
            "9999                         3   5        7788        8877             93          999          9999\n"+
            "6666                                    77778          87777      3   5 7         9999999       6666\n"+
            "6666     53                           66777       3      77766                   99999999999    6666\n"+
            "9999      95                        56667                  76665                   999999999    9999\n"+
            "6669     3 7                      5556                        6555     5             9999999    9666\n"+
            "7777              5      5                                                              9999    7777\n"+
            "7777                                     3           3    3                 5                   7777\n"+
            "8888    3                          33           5     9                                         8888\n"+
            "9999                                                  75                         5      3       9999\n"+
            "6666                  3     3   5                     3        5        3                       6666\n"+
            "9999          3                        5        3                                               9999\n"+
            "766666                                     5                                                  666667\n"+
            "777777777          5                                    3           5                      777777777\n"+
            "9999999999999                        3                                            3    9999999999999\n"+
            "9999999999999            5     5              99999999                    5   3        9999999999999\n"+
            "677777777           3    5                  999      999     5            5                777777776\n"+
            "666666         5        55                                       3        55                  666666\n"+
            "8888                    66   3      3   5        9999                     66                    8888\n"+
            "5555                   66                           99999                  66       5           5555\n"+
            "9999    3              66                               999                66            3      9999\n"+
            "5555             3    777                      9999            3     5     777                  5555\n"+
            "6666                  77        5      9      99                            77                  6666\n"+
            "7777                 777  3            9                                    777                 7777\n"+
            "8999      5         777               99                                     777           5    9998\n"+
            "6666               8888            9  9                         9            8888    3          6666\n"+
            "9999             88888             9  9                         9             88888             9999\n"+
            "7666           888888             99  9                   9     99             888888           6667\n"+
            "           999998888              9  99                   99     9       3      888899999           \n"+
            "        99999999988       93      9  9                     9     9      9        88999999999        \n"+
            "        999999999         57      9  9  9                  9  9  9      57   3     999999999        \n"+
            "        999999999     5    73  3  9  9  9                  9  9  9     5           999999999        \n"+
            "        99999999988               9     9                     9  9               88999999999        \n"+
            "           999998888              9     99                   99  9              888899999           \n"+
            "7666           888888             99     9                   9  99             888888           6667\n"+
            "9999             88888      5      9                         9  9        5    88888             9999\n"+
            "6666               8888            9                         9  9            8888       5       6666\n"+
            "8999     5          777                                     99               777             33 9998\n"+
            "7777                 777  3                                 9     5         777                 7777\n"+
            "6666                  77                            99      9               77                  6666\n"+
            "5555   3     3   5    777        3    5          9999                   3  777                  5555\n"+
            "9999                   66                999                               66     5             9999\n"+
            "5555                   66   5              99999                    5      66                   5555\n"+
            "8888                    66                     9999        5              66               5    8888\n"+
            "666666              3   55                                                55                  666666\n"+
            "677777777                5         5        999      999        3         5                777777776\n"+
            "9999999999999   5        5                    99999999                    5      5     9999999999999\n"+
            "9999999999999                                              3                           9999999999999\n"+
            "777777777                                                                                  777777777\n"+
            "766666              3       3            3                                       3            666667\n"+
            "9999                              3                   3   7         55       3                  9999\n"+
            "6666                                          5         57 4                        5           6666\n"+
            "9999         3         3                                 3    6                   57            9999\n"+
            "8888                    9               5          3                                 5  3   3   8888\n"+
            "7777                   375   3                                                 3   77           7777\n"+
            "7777    9999        5                         3          4              5                       7777\n"+
            "6669    9999999                   5556                        6555                    55        9666\n"+
            "9999    999999999                   56667                  76665                                9999\n"+
            "6666    99999999999       5      5    66777       5      77766            5                     6666\n"+
            "6666       9999999                      77778          87777                    3               6666\n"+
            "9999   5      999                         7788        8877                                  5   9999\n"+
            "9999           9                           7888      8887                                       9999\n"+
            "6666                  9     33    3         8888    8888             3              5           6666\n"+
            "6666                 99                      8888  8888         5                               6666\n"+
            "8888      5         9999      5              8888  8888     3                                   8888\n"+
            "8888               99999              5   3   88999988                                          8888\n"+
            "7777                99999                     89999998                      3                   7777\n"+
            "6666            3    9999                      999999                                           6666\n"+
            "7777                 9999         99           999999   3       99                              7777\n"+
            "8888                 99999        99   3       999999           99          7                   8888\n"+
            "7777                  9999        99            9999            99          37                  7777\n"+
            "6666                  9999        99            9999            99         59   3               6666\n"+
            "7777                  9999       7997      5    9999      5    7997      3                      7777\n"+
            "8888                             7997                          7997                             8888\n"+
            "7777                             7997                3         7997                             7777\n"+
            "8888                            679976                        679976                            8888\n"+
            "9999                            679976                        679976                            9999\n"+
            "66695867687669965778679869967656679976857859585      58595875867997665676996897687756996678676859666\n"+
            "66695967687669965778679869967656679976857859585      58595875867997665676996897687756996678676959666\n"+
            "66695967687669965778679869967656679976857859585      58595875867997665676996897687756996678676959666\n"+
            "66695566687666965778677969966656679976857859585      58595875867997665666996977687756966678666559666"
    },
    {
        name: "Sights",
        author: "Nerd69420",
        spawnpoints: [
            { x: 390, y: 0},
            { x: -390, y: 0}
        ],
        map:
            "964992773657435566623322237275763643799                      992225456423746656544424755362367399559\n"+
            "557993435543364755745663456746376322299               4      997343637457564634424656362675575799657\n"+
            "675996254534427245737333443999999999999      2               999999999999446763724373274375224599463\n"+
            "99999999999999999999999999999999999999    5              5    99999999999999999999999999999999999999\n"+
            "99999999999999999999999999999    3              1        4             99999999999999999999999999999\n"+
            "4359951264399999999995              8     7         5          8 4 1 2         999999999933465699764\n"+
            "53599422399999     5    5     1    89                          98      32             99999111599775\n"+
            "3469912699999               3999   89  5                       98   999         5      9999953199336\n"+
            "73599632999     15  99     994    789            88            987    499   4 99 5  1    99913399742\n"+
            "93799239999   1    94   4        789 4        9  99  9       4  987    5   5   59   3    99993599349\n"+
            "9639945999 2         2         77889          8      8         498877                     9996699479\n"+
            "94699439921   1  2        778888999 4         7 9  9 7           999888877          2  5   993199229\n"+
            "946994999          9  8888889999              6 9  9 6          1   9999888888  9 5     4  999199729\n"+
            "96599499    9    99   999999 2 1   2            8  8               2    999999 4 99    9 2  99199269\n"+
            "35399199 599  5 91 1    1  4    2       3       7  7               1  5           19  5 99  99699676\n"+
            "34499999  9 4                    2              6  6      5           2  3              19  99999563\n"+
            "7459999               8 3     4                 5  5           8     2       8    4          9999536\n"+
            "37499991     9  4   789            7      3                                  987     39  3   9999453\n"+
            "4939999     9      789  1        4         2                                4 987      9   3 9999374\n"+
            "4739999          78889       4                                                98887     11   9999672\n"+
            "366999  2     788889954                    3                 5   3          3  9988887     5  999227\n"+
            "67499 1    78888999        8                                           2 8    5 399988887      99544\n"+
            "75399  888889999   2     2 881                  6     5               1  8   3      999988888  99756\n"+
            "36499 899999        1  5  8           7777             5  7777 2                 5  5 2 999998 99223\n"+
            "63799   2    3 4              3  4  7788888              8888877               3           5   99723\n"+
            "48799      2                     7888899999              9999988887  1     3            5      99586\n"+
            "55699   2                      7888999                        9998887                      1   99524\n"+
            "37399        5          5    788999                              999887                 5      99463\n"+
            "63799           8        1  7899            5                       9987          5     5      99373\n"+
            "4749             6         489  2                          8          984      5        55      9645\n"+
            "5569          1   8        89                 4    1                   98         7             9274\n"+
            "6739              6        9   2                             6 3        9                       9526\n"+
            "3749   6    1                      4                8               5                      3    9656\n"+
            "6749  86               2       2         4             6 7    3                       5    4    9556\n"+
            "9479    6              5             6       2          65       4              4            8  9449\n"+
            "9739             2       5 4         1                                                        8 9229\n"+
            "9539        3                           7 6                               8       4             9349\n"+
            "5579                         3                                 2    5  1      4 2               9443\n"+
            "4379      789         5                                     1                       4  987      9332\n"+
            "5559       789   1  5           2                                                     987       9267\n"+
            "6779       789                      34        9      9                    4  4        987       9334\n"+
            "34599       789   4    2     5           2   99      99     5    2                   987       99263\n"+
            "336999      7899                 88         999      999      2               5     9987      999644\n"+
            "5799999      789    2                      9989      9899                8          987      9999967\n"+
            "95999999     7899      1                   989        989                          9987     99999979\n"+
            "97999999     7899  1             5        999          999                         9987     99999979\n"+
            "9999999       7899                        989          989        5               9987       9999999\n"+
            "9999999       7899                       999            999                       9987       9999999\n"+
            "999999                 98765     2       999            999             56789                 999999\n"+
            "999999                                                                                        999999\n"+
            "999999                                                                                        999999\n"+
            "999999                 98765 2           999            999             56789                 999999\n"+
            "9999999       7899                    2  999            999      5                9987       9999999\n"+
            "9999999       7899                        989          989      5                 9987       9999999\n"+
            "97999999     7899  3                      999          999                         9987     99999959\n"+
            "94999999     7899              68          989        989          5   5         1 9987     99999979\n"+
            "3699999      789      6         6    5     9989      9899                    4      987      9999965\n"+
            "565999      7899 4     6   2     6          999      999            5               9987      999775\n"+
            "45799       789        4                     99      99      5                   5   987       99266\n"+
            "6639       789                         5      9      9       2 5                      987       9765\n"+
            "7649       789      4                                                            5  3 987       9634\n"+
            "4359      789                             3                                   8        987      9434\n"+
            "7779                           68   3  4     8                   3   2    58       2            9723\n"+
            "9449         4    5      3                   8             6               8                    9629\n"+
            "9559       5          2         2                             3                      2          9679\n"+
            "96498 8          1                      1  2        2     8           1                  8   5  9569\n"+
            "7739           2                                        485         4                   1       9332\n"+
            "6679               5   3            4                          3                3               9222\n"+
            "3669      777              9   2     2       3                          9          67           9372\n"+
            "7579      7                89         5        7            3      3   98        7       4      9445\n"+
            "7369                  3    489                       6                984            6          9527\n"+
            "47699           88          7899                          4         9987            88         99273\n"+
            "53799        2        5      788999                              999887      6               5 99526\n"+
            "46799                     4    7888999                        9998887    4     6               99627\n"+
            "58499 3 34  5     3              7888899999   2          9999988887    3                 4  1  99586\n"+
            "37499        2 2          5         7788888              8888877                 2   3         99626\n"+
            "73399 899999          1     5   3     7777                7777   5 1     88            1999998 99573\n"+
            "33399  888889999 33 2        1                        6               1  6   3 2  5 999988888  99555\n"+
            "45399      78888999  1                  2                                        99988887     299355\n"+
            "336999  1     7888899  4          3   5               6      5    5            9988887        999343\n"+
            "7459999    3     78889   5   6                                        3    13 98887     4 1  9999755\n"+
            "7479999   1 9   3  789  1    8           68                          2        987      9   5 9999442\n"+
            "7659999  1 4 9    2 789    3          5                                      987    159 3  4 9999474\n"+
            "6549999      3 3      84 2             76       5  5      4        4         8   21          9999446\n"+
            "74599999 49 5          4   1       3            6  6    6                1  2   5   4    93 99999344\n"+
            "34699599  991   9 2 1       3 1              5  7  7            7   1 2 3          9    99  99499437\n"+
            "93499399  1 9   3991  999999    2               8  8       3      2     999999   99    9 3  99499279\n"+
            "944995999   3    5 9  8888889999 3 2          6 9  9 6        2     9999888888  91    4    999599779\n"+
            "947993299                 778888999  2        7 9  9 7          5999888877         5  5    991399339\n"+
            "9749965999   3  4              77889 1        8      8          98877   1   4  3   3    3 9991299359\n"+
            "93399269999       394  1      2  789   4      9  99  9       1  987     1      49        99994299359\n"+
            "56799624999     2   99     99     789            88         2  987     99  3  99   2 2   999 4299752\n"+
            "6449965599999           3   19995  89 2                        98   999        1       9999964299625\n"+
            "44599256299999            3 54     89 3                     5  98  53  5  4       1   99999226499527\n"+
            "467995422539999999999               8                          8  3 1          999999999935536599747\n"+
            "99999999999999999999999999999               35        3     3     1    99999999999999999999999999999\n"+
            "99999999999999999999999999999999999999                        99999999999999999999999999999999999999\n"+
            "537997347422623737657227244999999999999          2    4      999999999999633352547454665263632699772\n"+
            "655994754777725534334457362725442567299                      997647676577262225273637436774427799672\n"+
            "964993463437435475623322534452553672299   2                  992347264452537635443673552645465299639"
    },
    {
        name: "Shockwave",
        author: "Megalodon",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 }
        ],
        map:
            "999999999999999999999999999999999999999999999 6      6 999999999999999999999999999999999999999999999\n"+
            "999999999999999999999999999999999999999999999 6      6 999999999999999999999999999999999999999999999\n"+
            "9966666699999999999899999  5            6 999 6      6 999 6            5  9999989999999999966666699\n"+
            "99666999666666669999997                 66   66      66   66                 79999996666666699966699\n"+
            "99669966       699 8  7                  66666        66666                  7  8 996       66996699\n"+
            "996996                7    5                                            5    7                699699\n"+
            "99696              8       5         7                        7         5       8              69699\n"+
            "99696              8  7   5                                              5   7  8   9          69699\n"+
            "9996                      55   7     9        9      9        9     7   55                      6999\n"+
            "9996                 7                   5                5                   7                 6999\n"+
            "9996                       5         5                        5         5            9          6999\n"+
            "9996              8  7     5                                            5     7  88             6999\n"+
            "9996             8                      7      7    7      7                      8             6999\n"+
            "9996            88  7    55         5                          5         55    7  88    9       6999\n"+
            "9996                7    5     7         5                5         7     5    7         9      6999\n"+
            "99966               7                        6666666666                        7      8    9   66999\n"+
            "99999       8           5         9    5    66        66    5    9         5           8       99999\n"+
            "99999     8 8    77    5                    6  888888  6                    5    77    8 88    99999\n"+
            "9999    88      77     5      5          9  6 88    88 6  9          5      5     77      88    9999\n"+
            "999 8 8       7      55                     6 8      8 6                     55      7       8 8 999\n"+
            "99988         7      5                      6 8  88  8 6                      5      7         88999\n"+
            "999       777              7       7        6 8  88  8 6        7       7              777       999\n"+
            "999     77                 9   5            6 8      8 6            5   9                 77     999\n"+
            "999777           5     5               7    6 88    88 6    7               5     5           777999\n"+
            "999           5                             6  888888  6                             5           999\n"+
            "99         555                              66        66                              555         99\n"+
            "99   555               7     7               6666666666               7     7               555   99\n"+
            "995555   5         9               9    5                  5    9               9         5   555599\n"+
            "99            5                                                                      5            99\n"+
            "99                  5         5   5                              5   5         5                  99\n"+
            "99        5                                    9    9                                    5        99\n"+
            "99               7      9    7        9                      9        7    9      7               99\n"+
            "99   5                           7                                7                           5   99\n"+
            "99          9            7                                                7            9          99\n"+
            "99                  7                    55555        55555                    7                  99\n"+
            "99             5                        55                55                        5             99\n"+
            "99     9                              555   6          6   555                              9     99\n"+
            "99                           9       55   66666      66666   55       9                           99\n"+
            "99                    7         7   55  666              666  55   7         7                    99\n"+
            "99              9  5               55  66   888      888   66  55               5  9              99\n"+
            "9966      7   5                    5  66  888          888  66  5                    5   7      6699\n"+
            "99 66   5                 9       55 66  88   99    99   88  66 55       9                 5   66 99\n"+
            "999 6                            55 66  88  999      999  88  66 55                            6 999\n"+
            "999 6  5                         5  6   8  99          99  8   6  5                         5  6 999\n"+
            "999 6     9     6666666666   9     66  88 99            99 88  66     9   6666666666     9     6 999\n"+
            "   66          66        66           88  9              9  88           66        66          66   \n"+
            "6666           6  888888  6 5         8  99              99  8         5 6  888888  6           6666\n"+
            "             9 6 88    88 6      7       9                9       7      6 88    88 6 9             \n"+
            "               6 8      8 6                                              6 8      8 6               \n"+
            "        5      6 8  88  8 6                                              6 8  88  8 6      5        \n"+
            "        5      6 8  88  8 6                                              6 8  88  8 6      5        \n"+
            "               6 8      8 6                                              6 8      8 6               \n"+
            "             9 6 88    88 6      7       9                9       7      6 88    88 6 9             \n"+
            "6666           6  888888  6 5         8  99              99  8         5 6  888888  6           6666\n"+
            "   66          66        66           88  9              9  88           66        66          66   \n"+
            "999 6     9     6666666666   9     66  88 99            99 88  66     9   6666666666     9     6 999\n"+
            "999 6  5                         5  6   8  99          99  8   6  5                         5  6 999\n"+
            "999 6                            55 66  88  999      999  88  66 55                            6 999\n"+
            "99 66   5                 9       55 66  88   99    99   88  66 55       9                 5   66 99\n"+
            "9966      7   5                    5  66  888          888  66  5                    5   7      6699\n"+
            "99              9  5               55  66   888      888   66  55               5  9              99\n"+
            "99                    7         7   55  666              666  55   7         7                    99\n"+
            "99                           9       55   66666      66666   55       9                           99\n"+
            "99     9                              555   6          6   555                              9     99\n"+
            "99             5                        55                55                        5             99\n"+
            "99                  7                    55555        55555                    7                  99\n"+
            "99          9            7                                                7            9          99\n"+
            "99   5                           7                                7                           5   99\n"+
            "99               7      9    7        9                      9        7    9      7               99\n"+
            "99        5                                    9    9                                    5        99\n"+
            "99                  5         5   5                              5   5         5                  99\n"+
            "99            5                                                                      5            99\n"+
            "995555   5         9               9    5                  5    9               9         5   555599\n"+
            "99   555               7     7               6666666666               7     7               555   99\n"+
            "99         555                              66        66                              555         99\n"+
            "999           5                             6  888888  6                             5           999\n"+
            "999777           5     5               7    6 88    88 6    7               5     5           777999\n"+
            "999     77                 9   5            6 8      8 6            5   9                 77     999\n"+
            "999       777              7       7        6 8  88  8 6        7       7              777       999\n"+
            "99988         7      5                      6 8  88  8 6                      5      7         88999\n"+
            "999 8 8       7      55                     6 8      8 6                     55      7       8 8 999\n"+
            "9999    88      77     5      5          9  6 88    88 6  9          5      5     77      88    9999\n"+
            "99999    88 8    77    5                    6  888888  6                    5    77    8 8     99999\n"+
            "99999       8           5         9    5    66        66    5    9         5           8       99999\n"+
            "99966   9    8      7                        6666666666                        7      8        66999\n"+
            "9996      9         7    5     7         5                5         7     5    7                6999\n"+
            "9996       9    88  7    55         5                          5         55    7  88            6999\n"+
            "9996             8                      7      7    7      7                      8             6999\n"+
            "9996             88  7     5                                            5     7  8              6999\n"+
            "9996          9            5         5                        5         5                       6999\n"+
            "9996                 7                   5                5                   7                 6999\n"+
            "9996                      55   7     9        9      9        9     7   55                      6999\n"+
            "99696          9   8  7   5                                              5   7  8              69699\n"+
            "99696              8       5         7                        7         5       8              69699\n"+
            "996996                7    5                                            5    7                699699\n"+
            "99669966       699 8  7                  66666        66666                  7  8 996       66996699\n"+
            "99666999666666669999997                 66   66      66   66                 79999996666666699966699\n"+
            "9966666699999999999899999  5            6 999 6      6 999 6            5  9999989999999999966666699\n"+
            "999999999999999999999999999999999999999999999 6      6 999999999999999999999999999999999999999999999\n"+
            "999999999999999999999999999999999999999999999 6      6 999999999999999999999999999999999999999999999"
    },
    {
        name: "Clover",
        author: "Caramel",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 },
            { x: 390, y: 390 },
            { x: -390, y: -390 },
            { x: 0, y: -390 },
            { x: 0, y: 390 },
            { x: -390, y: 0 },
            { x: 390, y: 0 }
        ],
        pairings: [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [0, 1, 2, 3], // depends on number of teams, it will prioritize groups with most element that is lower than the teams count
            [4, 5, 6, 7]
        ],
        map:
            "                                                                                                    \n"+
            "  9999    9999    9999    9999    9999    9999    9999    9999    9999    9999    9999    9999      \n"+
            "  9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 \n"+
            "  9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 \n"+
            "  9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 \n"+
            "  9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 \n"+
            " 9999999999999                                99999999                                999999999999  \n"+
            " 99999999                                    999    999                                    9999999  \n"+
            " 9999999         6             6             99      99             6             6         999999  \n"+
            " 999999                   9        6  6     99        99     6  6        9                   99999  \n"+
            "  99999                                     99        99                                     999999 \n"+
            "  99999                                     99        99                                     999999 \n"+
            "  99999             6                       99        99                       6             999999 \n"+
            "  99999                         6            99      99            6                         999999 \n"+
            " 999999         6       6             9       9      9       9             6       6         99999  \n"+
            " 99999                                                                                        9999  \n"+
            " 99999   6                                                                                6   9999  \n"+
            " 99996       6              8            9                9            8              6       6999  \n"+
            "  9999                                  9                  9                                  99999 \n"+
            "  9999                          9      9                    9      9                          99999 \n"+
            "  9999                                 9                    9                                 99999 \n"+
            "  9999  6   8        8                                                        8        8   6  99999 \n"+
            " 99999           6        6                                              6        6           9999  \n"+
            " 99999                                                                                        9999  \n"+
            " 99999                               9                        9                               9999  \n"+
            " 99999                               9           99           9                               9999  \n"+
            "  9999      6   9         99999      9          8558          9      99999         9   6      99999 \n"+
            "  9999              6     955559     9         755557         9     955559     6              99999 \n"+
            "  9999                    9555559             59555595             9555559                    99999 \n"+
            "  9999   6                9555559             95555559             9555559                6   99999 \n"+
            " 99999         6          9555559             95555559             9555559          6         9999  \n"+
            " 99999             9       95559              95555559              95559       9             9999  \n"+
            " 99999                      999    9          99555599          9    999                      9999  \n"+
            " 99999                             9           995599           9                             9999  \n"+
            "  9999     6    7                 9             9999             9                 7    6     99999 \n"+
            "  9999                          99                                99                          99999 \n"+
            "  9999                                                                                        99999 \n"+
            "  9999                  9999                                            9999                  99999 \n"+
            " 99999                                                                                        9999  \n"+
            " 99999  9          99                                                          99          9  9999  \n"+
            " 99999            9                     999999        999999                     9            9999  \n"+
            " 99999           9                      9777779      9777779                      9           9999  \n"+
            "  9999                                  97555579    97555579                                  99999 \n"+
            "  9999                                  97533579    97533579                                  99999 \n"+
            "  9999   9999                           9753359      9533579                           9999   99999 \n"+
            "  9999 9999999                          97555          55579                          9999999 99999 \n"+
            " 99999999    99            69999         9779          9779         99996            99    9999999  \n"+
            " 9999999                  7555599         99            99         9955557                  999999  \n"+
            " 999999                  855555599                                995555558                  99999  \n"+
            " 999999                 9555555559                                9555555559                 99999  \n"+
            "  99999                 9555555559                                9555555559                 999999 \n"+
            "  99999                  855555599                                995555558                  999999 \n"+
            "  999999                  7555599         99            99         9955557                  9999999 \n"+
            "  9999999    99            69999         9779          9779         99996            99    99999999 \n"+
            " 99999 9999999                          97555          55579                          9999999 99999 \n"+
            " 99999   9999                           9753359      9533579                           9999   9999  \n"+
            " 99999                                  97533579    97533579                                  9999  \n"+
            " 99999                                  97555579    97555579                                  9999  \n"+
            "  9999           9                      9777779      9777779                      9           9999  \n"+
            "  9999            9                     999999        999999                     9            99999 \n"+
            "  9999  9          99                                                          99          9  99999 \n"+
            "  9999                                                                                        99999 \n"+
            " 99999                  9999                                            9999                  99999 \n"+
            " 99999                                                                                        9999  \n"+
            " 99999                          99                                99                          9999  \n"+
            " 99999     6    7                 9             9999             9                 7    6     9999  \n"+
            "  9999                             9           995599           9                             9999  \n"+
            "  9999                      999    9          99555599          9    999                      99999 \n"+
            "  9999             9       95559              95555559              95559       9             99999 \n"+
            "  9999         6          9555559             95555559             9555559          6         99999 \n"+
            " 99999   6                9555559             95555559             9555559                6   99999 \n"+
            " 99999                    9555559             59555595             9555559                    9999  \n"+
            " 99999              6     955559     9         755557         9     955559     6              9999  \n"+
            " 99999      6   9         99999      9          8558          9      99999         9   6      9999  \n"+
            "  9999                               9           99           9                               9999  \n"+
            "  9999                               9                        9                               99999 \n"+
            "  9999                                                                                        99999 \n"+
            "  9999           6        6                                              6        6           99999 \n"+
            " 99999  6   8        8                                                        8        8   6  99999 \n"+
            " 99999                                 9                    9                                 9999  \n"+
            " 99999                          9      9                    9      9                          9999  \n"+
            " 99999                                  9                  9                                  9999  \n"+
            "  9996       6              8            9                9            8              6       6999  \n"+
            "  9999   6                                                                                6   99999 \n"+
            "  9999                                                                                        99999 \n"+
            "  99999         6       6             9       9      9       9             6       6         999999 \n"+
            " 999999                         6            99      99            6                         999999 \n"+
            " 999999             6                       99        99                       6             99999  \n"+
            " 999999                                     99        99                                     99999  \n"+
            " 999999                                     99        99                                     99999  \n"+
            "  99999                   9        6  6     99        99     6  6        9                   999999 \n"+
            "  999999         6             6             99      99             6             6         9999999 \n"+
            "  9999999                                    999    999                                    99999999 \n"+
            "  999999999999                                99999999                                9999999999999 \n"+
            " 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999  \n"+
            " 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999  \n"+
            " 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999  \n"+
            " 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999  \n"+
            "      9999    9999    9999    9999    9999    9999    9999    9999    9999    9999    9999    9999  \n"+
            "                                                                                                    "
    },
    {
        name: "Spark",
        author: "Caramel",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 },
            { x: 390, y: 390 },
            { x: -390, y: -390 },
            { x: 0, y: -390 },
            { x: 0, y: 390 },
            { x: -390, y: 0 },
            { x: 390, y: 0 }
        ],
        pairings: [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [0, 1, 2, 3],
            [4, 5, 6, 7]
        ],
        map:
            "        9999 9999 7777 9993 77 499 77 999999999999999999999999 77 994 77 3999 7777 9999 9999        \n"+
            "         99  9999  77  9995    5996  69999999999999999999999996  6995    5999  77  9999  99         \n"+
            "  999753    999999    99999533599999999999999999999999999999999999999533599999    999999    357999  \n"+
            "  999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999  \n"+
            "  989999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999989  \n"+
            "  799999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999997  \n"+
            "  5999                                                                                        9995  \n"+
            "  3999                                   575            575                                   9993  \n"+
            "9  999            7           9          8963          3698          9           7            999  9\n"+
            "99 999                                   6654          4566                                   999 99\n"+
            "99 999                             7     5666          6665     7                             999 99\n"+
            "9  999                  6                4466          6644                6                  999  9\n"+
            "  9999                                    556          655                                    9999  \n"+
            "999999                                    5775        5775                                    999999\n"+
            "999999                         7           655        556           7                         999999\n"+
            "999999                                      575      575                                      999999\n"+
            "999999                   8                   554    455                   8                   999999\n"+
            "  9999                                   5    47    74    5                                   9999  \n"+
            "7  999     6                       95                          59                       6     999  7\n"+
            "77 999                            8996                        6998                            999 77\n"+
            "77 999                       6    6797                        7976    6                       999 77\n"+
            "7  999                             5894                      4985                             999  7\n"+
            "  9999                              797   8              8   797                              9999  \n"+
            "999999                              479                      974                              999999\n"+
            "999999      7                        697                    796                        7      999999\n"+
            "999999                                79                    97                                999999\n"+
            "359999                                486                  684                                999953\n"+
            "  5999             6                   78                  87                   6             9995  \n"+
            "7 3999                                  76                67                                  9993 7\n"+
            "7 3999                                  57                75                                  9993 7\n"+
            "  5999     8                             64              46                             8     9995  \n"+
            "359999                                   36      77      63                                   999953\n"+
            "999999                           99       5      99      5       99                           999999\n"+
            "999999                          9999             88             9999                          999999\n"+
            "999999             96           99998            77            89999           69             999999\n"+
            " 69999            9975           99997           55           79999           5799            99996 \n"+
            "7 9999        7   589874          89995          33          59998          478985   7        9999 7\n"+
            "7 9999             679976          79993                    39997          679976             9999 7\n"+
            " 69999               479974         5999                    9995         479974               99996 \n"+
            "999999                  7987         3999                  9993         7897                  999999\n"+
            "999999                    6875         997                799         5786                    999999\n"+
            "999999 58764   8            6763        795              597        3676            8   46785 999999\n"+
            "999999 8987654                465        593            395        564                4567898 999999\n"+
            "999999 56566774                           37            73                           47766565 999999\n"+
            "999999  34667774       5                    5          5                    5       47776643  999999\n"+
            "999999       4574                                                                  4754       999999\n"+
            "999999         554                                                                455         999999\n"+
            "999999          46                                                                64          999999\n"+
            "999999                                                                                        999999\n"+
            "999999                         798753                          357897                         999999\n"+
            "999999                         798753                          357897                         999999\n"+
            "999999                                                                                        999999\n"+
            "999999          46                                                                64          999999\n"+
            "999999         554                                                                455         999999\n"+
            "999999       4574                                                                  4754       999999\n"+
            "999999  34667774       5                    5          5                    5       47776643  999999\n"+
            "999999 56566774                           37            73                           47766565 999999\n"+
            "999999 8987654                465        593            395        564                4567898 999999\n"+
            "999999 58764   8            6763        795              597        3676            8   46785 999999\n"+
            "999999                    6875         997                799         5786                    999999\n"+
            "999999                  7987         3999                  9993         7897                  999999\n"+
            " 69999               479974         5999                    9995         479974               99996 \n"+
            "7 9999             679976          79993                    39997          679976             9999 7\n"+
            "7 9999        7   589874          89995          33          59998          478985   7        9999 7\n"+
            " 69999            9975           99997           55           79999           5799            99996 \n"+
            "999999             96           99998            77            89999           69             999999\n"+
            "999999                          9999             88             9999                          999999\n"+
            "999999                           99       5      99      5       99                           999999\n"+
            "359999                                   36      77      63                                   999953\n"+
            "  5999     8                             64              46                             8     9995  \n"+
            "7 3999                                  57                75                                  9993 7\n"+
            "7 3999                                  76                67                                  9993 7\n"+
            "  5999             6                   78                  87                   6             9995  \n"+
            "359999                                486                  684                                999953\n"+
            "999999                                79                    97                                999999\n"+
            "999999      7                        697                    796                        7      999999\n"+
            "999999                              479                      974                              999999\n"+
            "  9999                              797   8              8   797                              9999  \n"+
            "7  999                             5894                      4985                             999  7\n"+
            "77 999                       6    6797                        7976    6                       999 77\n"+
            "77 999                            8996                        6998                            999 77\n"+
            "7  999     6                       95                          59                       6     999  7\n"+
            "  9999                                   5    47    74    5                                   9999  \n"+
            "999999                   8                   554    455                   8                   999999\n"+
            "999999                                      575      575                                      999999\n"+
            "999999                         7           655        556           7                         999999\n"+
            "999999                                    5775        5775                                    999999\n"+
            "  9999                                    556          655                                    9999  \n"+
            "9  999                  6                4466          6644                6                  999  9\n"+
            "99 999                             7     5666          6665     7                             999 99\n"+
            "99 999                                   6654          4566                                   999 99\n"+
            "9  999            7           9          8963          3698          9           7            999  9\n"+
            "  3999                                   575            575                                   9993  \n"+
            "  5999                                                                                        9995  \n"+
            "  799999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999997  \n"+
            "  989999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999989  \n"+
            "  999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999  \n"+
            "  999753    999999    99999533599999999999999999999999999999999999999533599999    999999    357999  \n"+
            "         99  9999  77  9995    5996  69999999999999999999999996  6995    5999  77  9999  99         \n"+
            "        9999 9999 7777 9993 77 499 77 999999999999999999999999 77 994 77 3999 7777 9999 9999        "
    },
    {
        name: "Waves",
        author: "Caramel",
        spawnpoints: [
            { x: 390, y: -390 },
            { x: -390, y: 390 },
            { x: 390, y: 390 },
            { x: -390, y: -390 },
            { x: 0, y: -390 },
            { x: 0, y: 390 },
            { x: -390, y: 0 },
            { x: 390, y: 0 }
        ],
        pairings: [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [0, 1, 2, 3],
            [4, 5, 6, 7]
        ],
        map:
            "7779686678877668688868686887768676876887776786667667666876777886786768677886868688868667788766869777\n"+
            "6867677768668788878766787789999999997667877767678668767677787667999999999877876678788878668677767686\n"+
            "6777668668786788878788886999887777788999886777766776677776889998877777889996888878788876878668667776\n"+
            "86777866688797687678789997             7998676886886886768997             79998787678679788666877768\n"+
            "76876779999999999999975                  799866866668668997                  57999999999999997767867\n"+
            "8766679                                    57999999999975                                    9766678\n"+
            "667869                         3                                    3                         968766\n"+
            "67669                                                                                          96676\n"+
            "87769                      7                                            7                      96778\n"+
            "66669                              5                            5                              96666\n"+
            "67787               3                                                          3               78776\n"+
            "78776                                                                                          67787\n"+
            "76669                                   35796          69753                                   96667\n"+
            "68789                                   35777          77753                                   98786\n"+
            "76689                        9          335796        697533          9                        98667\n"+
            "77769                                    356795      597653                                    96777\n"+
            "77669              5     5               335679764467976533               5     5              96677\n"+
            "88777                               7     3355779999775533     7                               77788\n"+
            "68775                                      33557777775533                                      57786\n"+
            "6689       5                 5              333555555333              5                 5       9866\n"+
            "6769                                          33333333                                          9676\n"+
            "6879                 7                                                        7                 9786\n"+
            "7877                                                                                            7787\n"+
            "7775        5                               3          3                               5        5777\n"+
            "869                         965      7                        7      569                         968\n"+
            "689                        98753                                    35789                        986\n"+
            "769              9        9877532                                  2357789        9              967\n"+
            "889      7               98765                                        56789               7      988\n"+
            "869                     98765                6999999996                56789                     968\n"+
            "879          3         98775                887777777788                57789         3          978\n"+
            "789                    6765                 765555555567                 5676                    987\n"+
            "689                    555                  543333333345                  555                    986\n"+
            "769                     33                  3          3                  33                     967\n"+
            "7795             7       2      9     5                      5     9      2       7             5977\n"+
            "6697      9                                                                              9      7966\n"+
            "6869                    5                                                  5                    9686\n"+
            "86895                                          3    3                                          59868\n"+
            "87697                                                                                          79678\n"+
            "86679                                    96              69                                    97668\n"+
            "76669                                   9864            4689                                   96667\n"+
            "88689       333       9         5      9865              5689      5         9       333       98688\n"+
            "87889       53333                     9865      8888      5689                     33335       98878\n"+
            "87889       755333                    665       7777       566                    333557       98878\n"+
            "768795      9755333                    4        5555        4                    3335579      597867\n"+
            "888797      67955333     3   8753                                  3578   3     33355976      797888\n"+
            "778689        696533        6753                                    3576        335696        986877\n"+
            "766679         595533       9753  3                              3  3579       335595         976667\n"+
            "877679          77753       9753                                    3579       35777          976778\n"+
            "777789          69753       9753         875            578         3579       35796          987777\n"+
            "786869          49753       9753         875            578         3579       35794          968687\n"+
            "786869          49753       9753         875            578         3579       35794          968687\n"+
            "777789          69753       9753         875            578         3579       35796          987777\n"+
            "877679          77753       9753                                    3579       35777          976778\n"+
            "766679         595533       9753  3                              3  3579       335595         976667\n"+
            "778689        696533        6753                                    3576        335696        986877\n"+
            "888797      67955333     3   8753                                  3578   3     33355976      797888\n"+
            "768795      9755333                    4        5555        4                    3335579      597867\n"+
            "87889       755333                    665       7777       566                    333557       98878\n"+
            "87889       53333                     9865      8888      5689                     33335       98878\n"+
            "88689       333       9         5      9865              5689      5         9       333       98688\n"+
            "76669                                   9864            4689                                   96667\n"+
            "86679                                    96              69                                    97668\n"+
            "87697                                                                                          79678\n"+
            "86895                                          3    3                                          59868\n"+
            "6869                    5                                                  5                    9686\n"+
            "6697      9                                                                              9      7966\n"+
            "7795             7       2      9     5                      5     9      2       7             5977\n"+
            "769                     33                  3          3                  33                     967\n"+
            "689                    555                  543333333345                  555                    986\n"+
            "789                    6765                 765555555567                 5676                    987\n"+
            "879          3         98775                887777777788                57789         3          978\n"+
            "869                     98765                6999999996                56789                     968\n"+
            "889      7               98765                                        56789               7      988\n"+
            "769              9        9877532                                  2357789        9              967\n"+
            "689                        98753                                    35789                        986\n"+
            "869                         965      7                        7      569                         968\n"+
            "7775        5                               3          3                               5        5777\n"+
            "7877                                                                                            7787\n"+
            "6879                 7                                                        7                 9786\n"+
            "6769                                          33333333                                          9676\n"+
            "6689       5                 5              333555555333              5                 5       9866\n"+
            "68775                                      33557777775533                                      57786\n"+
            "88777                               7     3355779999775533     7                               77788\n"+
            "77669              5     5               335679764467976533               5     5              96677\n"+
            "77769                                    356795      597653                                    96777\n"+
            "76689                        9          335796        697533          9                        98667\n"+
            "68789                                   35777          77753                                   98786\n"+
            "76669                                   35796          69753                                   96667\n"+
            "78776                                                                                          67787\n"+
            "67787               3                                                          3               78776\n"+
            "66669                              5                            5                              96666\n"+
            "87769                      7                                            7                      96778\n"+
            "67669                                                                                          96676\n"+
            "667869                         3                                    3                         968766\n"+
            "8766679                                    57999999999975                                    9766678\n"+
            "76876779999999999999975                  799866866668668997                  57999999999999997767867\n"+
            "86777866688797687678789997             7998676886886886768997             79998787678679788666877768\n"+
            "6777668668786788878788886999887777788999886777766776677776889998877777889996888878788876878668667776\n"+
            "6867677768668788878766787789999999997667877767678668767677787667999999999877876678788878668677767686\n"+
            "7779686678877668688868686887768676876887776786667667666876777886786768677886868688868667788766869777"
    }
];





/* Imported from Abilities.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const ShipAbilities = {
    "Test ship": {
        /* THIS IS AN ABILITY SHIP TEMPLATE */
        hidden: true, // set to `true` if you want the mod to ignore this ship when compiling
        models: {
            default: "JSON string",
            ability: "another JSON string"
            // something: "another string",
        },
        name: "Test ability",
        tickInterval: 20, // in ticks, defaults to 1
        duration: 690, // in ticks,
        customEndcondition: true, // if you have other conditions to end the ability other than duration time
        // omit duration time if you don't need it to end on duration
        cooldown: 120, // in ticks,
        cooldownRestartOnEnd: true, // cooldown will restart on ability end
        customInAbilityText: true, // requirementsText(ship) will show up instead of "In Ability"
        // default false, only applied when `cooldownRestartOnEnd` is set
        range: 69, // ability range for special ships, in radii

        showAbilityRangeUI: true, // show the range UI on screen
        includeRingOnModel: true, // to include the indicator model in ship model or not
        // please note that `AbilityManager.includeRingOnModel` must be `true` in order for this to apply

        endOnDeath: true, // ability will end when ship dies
        canStartOnAbility: true, // allow ability to start even when on ability (to enable stacking, etc.), default false

        crystals: 500, // crystals when first set, default `AbilityManager.crystals`,

        generatorInit: 69, // generator value on first set, default maximum default model's energy capacity

        useRequirementsTextWhenReady: false, // if set to `true`, ability.requirementsText will be called even when the ability is ready 

        usageLimit: 69, // Maximum number of players on one team that are allowed to use this ship
        // default `AbilityManager.usageLimit`

        abilityBlocker: {
            // block a certain ship from starting abilities
            // only include this object if needed
            checker: function (ship) { return false }, // whether the ship will be blocked or not
            clear: function (ship) { }, // clear the blocker on the ship
            reason: "Ship is being affected by this ability", // Reason
            abilityDisabledText: "DISABLED" // text shown on the ability cooldown
        },

        shipChangeBlocker: {
            // block a certain ship from changing to other ships
            // only include this object if needed
            checker: function (ship) { return false }, // whether the ship will be blocked or not
            clear: function (ship) { }, // clear the blocker on the ship
            reason: "Ship is being affected by this ability" // Reason
        },

        // additionally, declearing `actionBlocker` object will let the compiler know that
        // both `shipChangeBlocker` and `abilityBlocker` will use the `actionBlocker` object
        // Note that `actionBlocker` will override the 2 others, so please handle with care.

        // Displaying text for ability when it can't be activated (e.g "2/3 kills")
        // optional, returns cooldown time left (in seconds)
        requirementsText: function (ship) {
            return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.cooldown);
        },

        // Displaying ability name
        // optional, just the ability name
        abilityName: function (ship) {
            return this.name;
        },

        // stuff to do when init ships
        // optional, do nothing
        initialize: function (ship) {

        },

        // check if ability can start
        // optional, returns if the cooldown is over
        canStart: function (ship) {
            return !ship.custom.inAbility && HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.cooldown);
        },

        // start the ability
        // optional, set ship to ability ship (models.ability --> codes.ability)
        start: function (ship, lastAbilityStatus) {
            ship.set({invulnerable: 100, type: this.codes.ability, stats: AbilityManager.maxStats, generator: 0});
        },

        // end the ability
        // optional, set ship to default ship (models.default --> codes.default)
        end: function (ship) {
            if (ship.custom.ability === this) ship.set({invulnerable: 100, type: this.codes.default, stats: AbilityManager.maxStats, generator: this.generatorInit});
        },

        // check if ability can end
        // optional, returns if the duration is over
        canEnd: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.duration);
        },

        // tick function if you want to do special stuff while on duration
        // optional, do nothing
        // duration: Current duration of the ability
        tick: function (ship, duration) {

        },

        // event function if you want to do special stuff while there's an event on duration
        // optional, end the ability when the ship dies (if `endOnDeath` is true)
        event: function (event, ship) {
            if (event.name == "ship_destroyed" && event.ship == ship && this.endOnDeath && ship.custom.inAbility) AbilityManager.end(ship);
        },

        // event to be executed globally (and indepently on ships)
        // optional, do nothing
        globalEvent: function (event) {

        },

        // tick function executed on (this.tick), independent with ships
        // optional, do nothing
        // Please note that this function will run before individual tick functions for ships
        globalTick: function (game) {

        },

        // functions executed before compiling this template
        // optional, do nothing
        compile: function (_this) { // _this: the `this` used in `this.options` or `this.tick`

        },

        // function used for skipping cooldown
        // optional, erase cooldown time
        reload: function (ship) {
            ship.custom.lastTriggered = game.step - this.cooldown;
        },

        // function used for restarting cooldown on ships
        // optional, recount cooldown time
        unload: function (ship) {
            ship.custom.lastTriggered = game.step;
        },

        // function used when the code changes (this should only happen on Mod Editor)
        // optional, do nothing
        // newTemplate: that new ship template after code changes, `null` if the template is removed on new code
        // Note: this function runs after initial compilation (ships and templates compilation)
        onCodeChanged: function (newTemplate) {

        },

        // function used to get the current default ship code of the given ship using this template
        // this is used for ships with 2 or more independent states like Vulcan and Viking, as neither of those states is called "ability state"
        // optional, return the default model's code
        getDefaultShipCode: function (ship) {
            return this.codes.default
        }
    },
    // the first 10
    "Advanced-Fighter": {
        models: {
            default: '{"name":"Advanced-Fighter","remodel":"Nex","level":6,"model":1,"size":2,"zoom":0.85,"specs":{"shield":{"capacity":[350,350],"reload":[7,7]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":400,"speed":[75,80],"rotation":[30,50],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-100,-80,-90,-50,0,50,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,15,25,38,25,20,0],"height":[0,5,10,30,25,20,10,0],"propeller":true,"texture":[4,4,3,1,10,8,1],"laser":{"damage":[90,150],"rate":1,"type":2,"speed":[180,240],"number":1,"recoil":150,"error":0}},"side_connector":{"section_segments":12,"offset":{"x":45,"y":-20,"z":-90},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-20,-3,0,-1,4,3,15,15,20,25,25],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,18,16,16,13,12,16,18,20,0],"height":[0,20,20,18,16,16,13,12,16,18,20,0],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12,4],"vertical":1,"angle":110},"side_connector2":{"section_segments":12,"offset":{"x":45,"y":-20,"z":-50},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-20,-3,0,-1,4,3,15,15,20,25,25],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,18,16,16,13,12,16,18,20,0],"height":[0,20,20,18,16,16,13,12,16,18,20,0],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12,4],"vertical":1,"angle":110},"arm_right":{"section_segments":[15,35,105,125,195,215,285,305],"offset":{"x":0,"y":50,"z":-35},"position":{"x":[85,85,85,85,70],"y":[-20,-20,65,65,80],"z":[0,0,0,0,0]},"width":[0,20,20,20,0],"height":[0,20,20,20,0],"texture":[1,3,3,3],"propeller":false,"angle":1.5},"arm_left":{"section_segments":[55,75,145,165,235,255,325,345],"offset":{"x":0,"y":50,"z":-35},"position":{"x":[-85,-85,-85,-85,-70],"y":[-20,-20,65,65,80],"z":[0,0,0,0,0]},"width":[0,20,20,20,0],"height":[0,20,20,20,0],"texture":[1,3,3,3],"propeller":false,"angle":-1.5},"armdetail1":{"section_segments":8,"angle":20,"offset":{"x":90,"y":-20,"z":-70},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,5,5,8,8],"z":[0,0,0,0,0,0]},"height":[0,45,35,25,20,0],"width":[0,14,15,12,8,0],"texture":[2,63,63,4,17],"vertical":1},"Main_rings":{"section_segments":10,"offset":{"x":85,"y":30,"z":-35},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-21,-18,-16,-14,-14,4,4,6,6,8],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,12,16,16,16,16,16,12,12,0],"height":[0,12,16,16,16,16,16,12,12,0],"texture":[17.93,4,4,4,13,17,4,18],"angle":1.5},"Main_rings2":{"section_segments":10,"offset":{"x":85,"y":20,"z":-35},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-21,-18,-16,-14,-14,4,4,6,6,8],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,12,12,12,12,12,10,10,0],"height":[0,10,12,12,12,12,12,10,10,0],"texture":[17.93,4,4,4,18,17,4,18],"angle":1.5},"barrelholder":{"section_segments":5,"offset":{"x":84,"y":-6,"z":-35},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,12,12],"height":[0,8,8],"texture":[63],"propeller":false,"angle":1.5},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-35,"z":33},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-20,10,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,8,14,10,0],"height":[0,12,18,12,0],"propeller":false,"texture":[7,9,9,7]},"side_propellers":{"section_segments":10,"offset":{"x":30,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-50,-20,0,20,80,70],"z":[0,0,0,0,0,0]},"width":[15,20,10,25,10,0],"height":[10,15,15,10,5,0],"angle":0,"propeller":true,"texture":[3,63,4,10,3]},"cannons":{"section_segments":12,"offset":{"x":90,"y":25,"z":-35},"position":{"x":[0,0,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[2,4,4,2],"height":[2,5,5,2],"angle":1.5,"propeller":false,"texture":6,"laser":{"damage":[4,10],"rate":3,"type":1,"speed":[100,160],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":80,"y":20,"z":-35},"position":{"x":[0,0,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[2,4,4,2],"height":[2,5,5,2],"angle":1.5,"propeller":false,"texture":6,"laser":{"damage":[4,10],"rate":3,"type":1,"speed":[100,170],"number":1,"error":0}}},"wings":{"main":{"length":[100,25,14],"width":[100,70,40,30],"angle":[-25,20,25],"position":[30,70,50,30],"bump":{"position":-20,"size":10},"offset":{"x":0,"y":0,"z":0},"texture":[18,8,63],"doubleside":true},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-50,-70,-65],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Advanced-Fighter","level":6,"model":1,"code":601,"specs":{"shield":{"capacity":[350,350],"reload":[7,7]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":400,"speed":[75,80],"rotation":[30,50],"acceleration":[70,100]}},"shape":[4,3.65,3.454,3.504,3.567,2.938,1.804,1.672,1.659,1.943,3.763,3.851,3.84,5.112,5.235,5.382,5.36,5.355,5.781,6.175,6.057,5.912,4.712,4.626,4.479,4.008,4.479,4.626,4.712,5.912,6.057,6.175,5.781,5.355,5.36,5.382,5.235,5.112,3.84,3.851,3.763,1.943,1.659,1.672,1.804,2.938,3.567,3.504,3.454,3.65],"lasers":[{"x":0,"y":-4,"z":0.4,"angle":0,"damage":[90,150],"rate":1,"type":2,"speed":[180,240],"number":1,"spread":0,"error":0,"recoil":150},{"x":3.548,"y":-0.999,"z":-1.4,"angle":1.5,"damage":[4,10],"rate":3,"type":1,"speed":[100,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.548,"y":-0.999,"z":-1.4,"angle":-1.5,"damage":[4,10],"rate":3,"type":1,"speed":[100,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.148,"y":-1.199,"z":-1.4,"angle":1.5,"damage":[4,10],"rate":3,"type":1,"speed":[100,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.148,"y":-1.199,"z":-1.4,"angle":-1.5,"damage":[4,10],"rate":3,"type":1,"speed":[100,170],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.175}}',
        },
        name: "EMP",
        endOnDeath: false,
        duration: 4 * 60,
        cooldown: 31 * 60,
        range: 45,
        showAbilityRangeUI: true,
        includeRingOnModel: true,
        selfDMG: 150,

        actionBlocker: {
            checker: function (ship) {
                return ship.custom.EMP
            },
            clear: function (ship) {
                ship.custom.EMP = false;
                ship.custom.lastEMP = null;
                HelperFunctions.TimeManager.clearTimeout(ship.custom.lastEMP);
            },
            reason: "Ship is being blocked by EMP Shockwave",
            abilityDisabledText: "EMP-Shocked"
        },

        removeEMP: function (ship) {
            ship.set({idle: false});
            this.actionBlocker.clear(ship);
        },

        start: function (ship) {
            let EMPaffectedPlayers = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true }, true);
            for (let victim of EMPaffectedPlayers) {
                if (victim.custom.lastEMP != null) HelperFunctions.TimeManager.clearTimeout(victim.custom.lastEMP);
                victim.custom.EMP = true;
                victim.set({idle: true, vx: 0, vy: 0});
                HelperFunctions.damage(victim, this.selfDMG);
                victim.custom.lastEMP = HelperFunctions.TimeManager.setTimeout(function () {
                    if (victim.custom.EMP) this.removeEMP(victim);
                }.bind(this), this.duration);
            }
            HelperFunctions.damage(ship, this.selfDMG);
        },

        event: function () {},

        end: function () {},

        globalEvent: function (event) {
            if (event.name == "ship_destroyed" && event.ship != null) this.removeEMP(event.ship);
        }
    },
    "Scorpion": {
        models: {
            default: '{"name":"Scorpion","remodel":"Nex","level":6,"model":2,"size":2,"specs":{"shield":{"capacity":[225,400],"reload":[5,7]},"generator":{"capacity":[80,175],"reload":[53,53]},"ship":{"mass":440,"speed":[75,90],"rotation":[50,70],"acceleration":[80,102]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-60,-40,-30,0,50,100,120,110],"z":[-10,-5,-5,0,0,0,0,20,20]},"width":[0,5,12,20,15,25,10,5],"height":[0,6,10,15,25,15,10,5],"texture":[5,4,4,63,11,11,4],"propeller":false},"side_connector":{"section_segments":12,"offset":{"x":25,"y":0,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-30,-3,0,-1,4,3,25,25,30,65,45],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,16,18,16,14,14,11,10,14,16,16,0],"height":[0,16,18,16,14,14,11,10,14,16,16,0],"propeller":false,"texture":[4,13,4,8,4,17,63,18,4,12,4],"angle":135},"tail":{"section_segments":14,"offset":{"x":0,"y":70,"z":50},"position":{"x":[0,0,0,0,0,0],"y":[-70,-32,-10,20,40,50],"z":[0,0,0,0,-10,-20]},"width":[0,5,35,25,5,5],"height":[0,5,25,20,5,5],"texture":[5,4,63,10,4],"laser":{"damage":[50,100],"rate":1,"type":2,"speed":[225,225],"number":1,"angle":0,"error":0,"recoil":100}},"observers":{"section_segments":8,"offset":{"x":13,"y":-44,"z":12},"position":{"x":[-5,0,0,0,0],"y":[-15,-5,0,5,15],"z":[0,0,0,1,0]},"width":[0,8,10,8,0],"height":[0,5,5,5,0],"texture":[17,5],"propeller":false},"observers2":{"section_segments":8,"offset":{"x":8,"y":-24,"z":25},"position":{"x":[-5,0,0,0,0],"y":[-15,-5,0,5,15],"z":[0,0,0,1,0]},"width":[0,6,8,6,0],"height":[0,3,3,3,0],"texture":[17,5],"propeller":false},"deco":{"section_segments":8,"offset":{"x":70,"y":0,"z":-10},"position":{"x":[-5,0,4,10,-5,0,-10,-10],"y":[-125,-80,-80,-60,-30,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[1,8,10,15,20,20,15,0],"height":[1,8,15,20,24,25,15,0],"texture":[5,4,4,4,3,8,17],"angle":5,"propeller":true},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":65,"y":-10,"z":55},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[20,20,15,15,20],"texture":[63]},"claws":{"section_segments":8,"offset":{"x":90,"y":-80,"z":-10},"position":{"x":[-30,0,4,2,0,0],"y":[-45,-10,0,10,20,35],"z":[0,0,0,0,0,0]},"width":[1,12,15,20,25,0],"height":[1,15,22,20,20,0],"texture":[5,4,63,4],"angle":-20,"propeller":false},"laser1":{"section_segments":0,"offset":{"x":86,"y":-60,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-25,-30,-20,0,5,5],"z":[0,0,0,0,0,0]},"width":[0,3,5,5,5,3],"height":[0,3,5,5,5,3],"texture":[12,6,63,63,6],"angle":18,"laser":{"damage":[25,25],"rate":3,"type":1,"speed":[160,160],"number":1,"error":0}}},"wings":{"font":{"length":[60,30],"width":[30,25],"angle":[-10,20],"position":[-20,-40],"texture":18,"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Scorpion","level":6,"model":2,"code":602,"specs":{"shield":{"capacity":[225,400],"reload":[5,7]},"generator":{"capacity":[80,175],"reload":[53,53]},"ship":{"mass":440,"speed":[75,90],"rotation":[50,70],"acceleration":[80,102]}},"shape":[3.6,2.609,2.313,5.434,6.143,6.028,5.698,5.48,5.278,4.884,3.558,3.593,3.58,3.375,3.239,3.142,2.331,1.47,1.417,1.387,1.635,2.973,3.47,3.911,4.481,4.804,4.481,3.911,3.47,2.973,1.635,1.387,1.417,1.47,2.331,3.142,3.239,3.375,3.58,3.593,3.558,4.884,5.278,5.48,5.698,6.028,6.143,5.434,2.313,2.609],"lasers":[{"x":0,"y":0,"z":2,"angle":0,"damage":[50,100],"rate":1,"type":2,"speed":[225,225],"number":1,"spread":0,"error":0,"recoil":100},{"x":3.069,"y":-3.541,"z":-0.4,"angle":18,"damage":[25,25],"rate":3,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.069,"y":-3.541,"z":-0.4,"angle":-18,"damage":[25,25],"rate":3,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.143}}',
            ability: '{"name":"Odyssey","level":7,"model":2,"size":3.8,"specs":{"shield":{"capacity":[1500,1500],"reload":[20,20]},"generator":{"capacity":[700,700],"reload":[200,200]},"ship":{"mass":1000,"speed":[50,50],"rotation":[25,25],"acceleration":[150,150]}},"tori":{"circle":{"segments":20,"radius":95,"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],"height":[8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],"texture":[63,63,4,10,4,4,10,4,63,63,63,63,3,10,3,3,10,3,63]}},"bodies":{"main":{"section_segments":20,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-130,-130,-85,-70,-60,-20,-25,40,40,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,40,45,10,12,30,30,40,30,0],"height":[0,20,25,25,10,12,25,25,20,10,0],"texture":[4,15,63,4,4,4,11,10,4,12]},"side_connector":{"section_segments":12,"offset":{"x":0,"y":-60,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-24,-24,-8,-4,-6,-2,1,15,15,20,25,25],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,24,22,20,18,18,15,14,18,25,26,0],"height":[0,24,22,20,18,18,16,14,18,25,26,0],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12,4],"angle":0},"cannon":{"section_segments":6,"offset":{"x":0,"y":-115,"z":0},"position":{"x":[0,0,0,0],"y":[-25,-30,-20,0],"z":[0,0,0,0]},"width":[0,15,9,7],"height":[0,10,9,7],"texture":[6,6,6,10],"laser":{"damage":[250,250],"rate":1,"type":2,"speed":[100,100],"number":1,"error":0,"recoil":300}},"cockpit":{"section_segments":10,"offset":{"x":0,"y":0,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,0,10,30],"z":[0,0,0,0,0]},"width":[0,12,15,10,0],"height":[0,20,22,18,0],"texture":[9]},"bumpers":{"section_segments":8,"offset":{"x":75,"y":20,"z":0},"position":{"x":[-5,0,5,10,5,0,-5],"y":[-85,-80,-40,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,10,15,15,15,5,0],"height":[0,20,35,35,25,15,0],"texture":[11,2,63,4,3],"angle":10},"toppropulsors":{"section_segments":10,"offset":{"x":17,"y":50,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[3,4,10,3,3,63,4],"propeller":true},"bottompropulsors":{"section_segments":10,"offset":{"x":17,"y":50,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[3,4,10,3,3,63,4],"propeller":true},"vanish":{"section_segments":12,"offset":{"x":0,"y":0,"z":-105},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar1":{"section_segments":12,"offset":{"x":0,"y":0,"z":-99.86092984232205},"position":{"x":[32.446797854747295,32.446797854747295,32.446797854747295,32.446797854747295,32.446797854747295,32.446797854747295,32.446797854747295],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar2":{"section_segments":12,"offset":{"x":0,"y":0,"z":-84.94676778996508},"position":{"x":[61.71747436535096,61.71747436535096,61.71747436535096,61.71747436535096,61.71747436535096,61.71747436535096,61.71747436535096],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar3":{"section_segments":12,"offset":{"x":0,"y":0,"z":-61.71741717873937},"position":{"x":[84.94680933846453,84.94680933846453,84.94680933846453,84.94680933846453,84.94680933846453,84.94680933846453,84.94680933846453],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar4":{"section_segments":12,"offset":{"x":0,"y":0,"z":-32.44673062785233},"position":{"x":[99.86095168564933,99.86095168564933,99.86095168564933,99.86095168564933,99.86095168564933,99.86095168564933,99.86095168564933],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar5":{"section_segments":12,"offset":{"x":0,"y":0,"z":0.00007068653587816622},"position":{"x":[104.99999999997621,104.99999999997621,104.99999999997621,104.99999999997621,104.99999999997621,104.99999999997621,104.99999999997621],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar6":{"section_segments":12,"offset":{"x":0,"y":0,"z":32.44686508162755},"position":{"x":[99.86090799894951,99.86090799894951,99.86090799894951,99.86090799894951,99.86090799894951,99.86090799894951,99.86090799894951],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar7":{"section_segments":12,"offset":{"x":0,"y":0,"z":61.71753155193459},"position":{"x":[84.94672624142709,84.94672624142709,84.94672624142709,84.94672624142709,84.94672624142709,84.94672624142709,84.94672624142709],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar8":{"section_segments":12,"offset":{"x":0,"y":0,"z":84.94685088692552},"position":{"x":[61.71735999209981,61.71735999209981,61.71735999209981,61.71735999209981,61.71735999209981,61.71735999209981,61.71735999209981],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar9":{"section_segments":12,"offset":{"x":0,"y":0,"z":99.86097352893135},"position":{"x":[32.446663400942676,32.446663400942676,32.446663400942676,32.446663400942676,32.446663400942676,32.446663400942676,32.446663400942676],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar10":{"section_segments":12,"offset":{"x":0,"y":0,"z":104.99999999990483},"position":{"x":[-0.0001413730717563004,-0.0001413730717563004,-0.0001413730717563004,-0.0001413730717563004,-0.0001413730717563004,-0.0001413730717563004,-0.0001413730717563004],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar11":{"section_segments":12,"offset":{"x":0,"y":0,"z":99.86088615553172},"position":{"x":[-32.44693230849311,-32.44693230849311,-32.44693230849311,-32.44693230849311,-32.44693230849311,-32.44693230849311,-32.44693230849311],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar12":{"section_segments":12,"offset":{"x":0,"y":0,"z":84.94668469285065},"position":{"x":[-61.71758873849021,-61.71758873849021,-61.71758873849021,-61.71758873849021,-61.71758873849021,-61.71758873849021,-61.71758873849021],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar13":{"section_segments":12,"offset":{"x":0,"y":0,"z":61.71730280543227},"position":{"x":[-84.946892435348,-84.946892435348,-84.946892435348,-84.946892435348,-84.946892435348,-84.946892435348,-84.946892435348],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar14":{"section_segments":12,"offset":{"x":0,"y":0,"z":32.44659617401825},"position":{"x":[-99.86099537216813,-99.86099537216813,-99.86099537216813,-99.86099537216813,-99.86099537216813,-99.86099537216813,-99.86099537216813],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar15":{"section_segments":12,"offset":{"x":0,"y":0,"z":-0.00021205960758774112},"position":{"x":[-104.99999999978587,-104.99999999978587,-104.99999999978587,-104.99999999978587,-104.99999999978587,-104.99999999978587,-104.99999999978587],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar16":{"section_segments":12,"offset":{"x":0,"y":0,"z":-32.44699953534397},"position":{"x":[-99.86086431206866,-99.86086431206866,-99.86086431206866,-99.86086431206866,-99.86086431206866,-99.86086431206866,-99.86086431206866],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar17":{"section_segments":12,"offset":{"x":0,"y":0,"z":-61.717645925017926},"position":{"x":[-84.94664314423565,-84.94664314423565,-84.94664314423565,-84.94664314423565,-84.94664314423565,-84.94664314423565,-84.94664314423565],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar18":{"section_segments":12,"offset":{"x":0,"y":0,"z":-84.94693398373195},"position":{"x":[-61.7172456187368,-61.7172456187368,-61.7172456187368,-61.7172456187368,-61.7172456187368,-61.7172456187368,-61.7172456187368],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar19":{"section_segments":12,"offset":{"x":0,"y":0,"z":-99.86101721535962},"position":{"x":[-32.44652894707921,-32.44652894707921,-32.44652894707921,-32.44652894707921,-32.44652894707921,-32.44652894707921,-32.44652894707921],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar20":{"section_segments":12,"offset":{"x":0,"y":0,"z":-104.9999999996193},"position":{"x":[0.0002827461435123445,0.0002827461435123445,0.0002827461435123445,0.0002827461435123445,0.0002827461435123445,0.0002827461435123445,0.0002827461435123445],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}},"vanishstar21":{"section_segments":12,"offset":{"x":0,"y":0,"z":-99.86084246856036},"position":{"x":[32.44706676218008,32.44706676218008,32.44706676218008,32.44706676218008,32.44706676218008,32.44706676218008,32.44706676218008],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0}}},"wings":{"topjoin":{"offset":{"x":0,"y":-3,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[25],"position":[0,0,0,50],"texture":[1],"bump":{"position":10,"size":30}},"bottomjoin":{"offset":{"x":0,"y":-3,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[-25],"position":[0,0,0,50],"texture":[1],"bump":{"position":-10,"size":30}}},"typespec":{"name":"Odyssey","level":7,"model":2,"code":702,"specs":{"shield":{"capacity":[1500,1500],"reload":[20,20]},"generator":{"capacity":[700,700],"reload":[200,200]},"ship":{"mass":1000,"speed":[50,50],"rotation":[25,25],"acceleration":[150,150]}},"shape":[11.042,11.064,9.998,8.53,7.479,3.557,6.811,7.088,6.949,6.822,8.519,8.508,8.426,8.426,8.508,8.519,8.118,8.409,8.506,8.317,5.034,5.905,7.392,7.863,7.737,7.386,7.737,7.863,7.392,5.905,5.034,8.317,8.506,8.409,8.118,8.519,8.508,8.426,8.426,8.508,8.519,6.822,6.949,7.088,6.811,3.557,7.479,8.53,9.998,11.064],"lasers":[{"x":0,"y":-11.02,"z":0,"angle":0,"damage":[250,250],"rate":1,"type":2,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":300},{"x":0,"y":-2.28,"z":-7.98,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.466,"y":-2.28,"z":-7.589,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":4.691,"y":-2.28,"z":-6.456,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":6.456,"y":-2.28,"z":-4.691,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":7.589,"y":-2.28,"z":-2.466,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":7.98,"y":-2.28,"z":0,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":7.589,"y":-2.28,"z":2.466,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":6.456,"y":-2.28,"z":4.691,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":4.691,"y":-2.28,"z":6.456,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.466,"y":-2.28,"z":7.589,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.28,"z":7.98,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.466,"y":-2.28,"z":7.589,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.691,"y":-2.28,"z":6.456,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-6.456,"y":-2.28,"z":4.691,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-7.589,"y":-2.28,"z":2.466,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-7.98,"y":-2.28,"z":0,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-7.589,"y":-2.28,"z":-2.466,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-6.456,"y":-2.28,"z":-4.691,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.691,"y":-2.28,"z":-6.456,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.466,"y":-2.28,"z":-7.589,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.28,"z":-7.98,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.466,"y":-2.28,"z":-7.589,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":11.064}}'
        },
        name: "ody healig",
        duration: 20 * 60,
        cooldown: 45 * 60,
        endOnDeath: true,
        start: function (ship) {
            ship.set({invulnerable:100,type:this.codes.ability,generator:0,shield:1000, stats: AbilityManager.maxStats});
        },
        end: function (ship) {
            ship.set({type: this.codes.default, invulnerable: 100, stats: AbilityManager.maxStats});
        }
    },
    "Marauder": {
        models: {
            default: '{"name":"Marauder","remodel":"Nex","level":6,"model":3,"size":1.4,"specs":{"shield":{"capacity":[330,330],"reload":[8,11]},"generator":{"capacity":[85,200],"reload":[48,48]},"ship":{"mass":255,"speed":[70,110],"rotation":[60,85],"acceleration":[80,125]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-55,-40,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,18,23,30,25,25,30,35,0],"height":[0,5,10,12,12,20,15,15,15,0],"texture":[6,4,2,8,4,2,11,12,17],"propeller":true,"laser":{"damage":[14,14],"rate":10,"type":1,"speed":[220,220],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-85,"z":22},"position":{"x":[0,0,0,0,0,0],"y":[15,35,60,95,125],"z":[-1,-2,-1,-1,3]},"width":[5,8,14,15,5],"height":[0,12,15,15,0],"texture":[8.98,8.98,4]},"outriggers":{"section_segments":10,"offset":{"x":25,"y":0,"z":-10},"position":{"x":[0,-1,8,-5,0,0,0,0,0,0],"y":[-80,-120,-45,0,30,40,70,80,100,90],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,15,15,15,15,10,0],"height":[0,10,20,25,25,25,25,25,20,0],"texture":[13,4,4,63,4,18,4,13,17],"laser":{"damage":[6,6],"rate":4,"type":1,"speed":[150,150],"recoil":0,"number":1,"error":0},"propeller":true},"cannons":{"section_segments":8,"offset":{"x":20,"y":-135,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[5,0,23,27,62,62,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,7,4,4,7,7],"height":[0,5,5,7,7,4,4,7,7],"texture":[12,13,4,8,4,4,3,8],"propeller":false},"intake":{"section_segments":12,"offset":{"x":25,"y":-5,"z":10},"position":{"x":[0,0,5,0,-3,0,0,0,0,0],"y":[-10,-30,-5,35,60,70,85,100,85],"z":[0,-6,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,15,15,20,20,15,15,5,0],"texture":[6,4,63,4,63,18,4,17]}},"wings":{"main":{"length":[20,70,35],"width":[50,55,40,20],"angle":[0,-20,0],"position":[20,20,70,25],"texture":[3,18,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":0,"y":0,"z":13}},"spoiler":{"length":[20,45,0,5],"width":[40,40,20,30,0],"angle":[0,20,90,90],"position":[60,60,80,80,90],"texture":[10,11,63],"doubleside":true,"bump":{"position":30,"size":18},"offset":{"x":0,"y":0,"z":30}},"font":{"length":[45],"width":[50,20],"angle":[-40],"position":[0,-40],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":30,"y":20,"z":10}},"font2":{"length":[35],"width":[20,20],"angle":[-41],"position":[0,35],"texture":[2],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":30,"y":-50,"z":10}},"SPIKES":{"length":[30],"width":[50,40],"angle":[-20],"position":[0,55],"texture":[63],"doubleside":true,"bump":{"position":30,"size":5},"offset":{"x":20,"y":-100,"z":0}},"shields":{"doubleside":true,"offset":{"x":12,"y":60,"z":-15},"length":[0,15,45,20],"width":[30,30,65,65,30,30],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[4],"bump":{"position":0,"size":4}}},"typespec":{"name":"Marauder","level":6,"model":3,"code":603,"specs":{"shield":{"capacity":[330,330],"reload":[8,11]},"generator":{"capacity":[85,200],"reload":[48,48]},"ship":{"mass":255,"speed":[70,110],"rotation":[60,85],"acceleration":[80,125]}},"shape":[2.665,3.844,3.73,2.981,2.588,2.359,2.116,1.846,1.699,1.991,1.94,1.863,1.78,3.408,3.491,3.521,3.44,3.385,3.439,3.481,3.181,2.932,2.962,2.944,2.85,2.244,2.85,2.944,2.962,2.932,3.181,3.481,3.439,3.385,3.44,3.521,3.491,3.408,1.78,1.863,1.94,1.991,1.699,1.846,2.116,2.359,2.588,2.981,3.73,3.844],"lasers":[{"x":0,"y":-2.66,"z":0.28,"angle":0,"damage":[14,14],"rate":10,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.672,"y":-3.36,"z":-0.28,"angle":0,"damage":[6,6],"rate":4,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.672,"y":-3.36,"z":-0.28,"angle":0,"damage":[6,6],"rate":4,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.844}}',
            ability: '{"name":"Marauder","level":7,"model":3,"size":1.5,"specs":{"shield":{"capacity":[350,350],"reload":[11,11]},"generator":{"capacity":[140,140],"reload":[1e+300,1e+300]},"ship":{"mass":1000,"speed":[0.00001,0.00001],"rotation":[0.00001,0.00001],"acceleration":[150,150]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-55,-40,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,18,23,30,25,25,30,35,0],"height":[0,5,10,12,12,20,15,15,15,0],"texture":[6,4,1,10,1,1,11,12,17],"propeller":true,"laser":{"damage":[30,30],"rate":10,"type":1,"speed":[130,130],"recoil":0,"number":1,"error":0}},"main2":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0],"y":[-65,-75],"z":[0,0]},"width":[0,6],"height":[0,5],"texture":[6,4],"laser":{"damage":[50,50],"rate":10,"type":1,"speed":[0.01,0.01],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-85,"z":22},"position":{"x":[0,0,0,0,0,0],"y":[15,35,60,95,125],"z":[-1,-2,-1,-1,3]},"width":[5,12,14,15,5],"height":[0,12,15,15,0],"texture":[5,17,4]},"outriggers":{"section_segments":10,"offset":{"x":35,"y":0,"z":-10},"position":{"x":[-5,-5,8,-5,0,0,0,0,0,0],"y":[-100,-125,-45,0,30,40,70,80,100,90],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,8,15,15,18,18,18,18,10,0],"height":[0,10,20,25,25,25,25,25,20,0],"texture":[13,4,4,63,4,18,4,13,17],"laser":{"damage":[30,30],"rate":10,"type":1,"speed":[120,120],"recoil":0,"number":1,"error":0,"angle":2.5},"propeller":true},"intake":{"section_segments":12,"offset":{"x":25,"y":-5,"z":10},"position":{"x":[0,0,5,0,-3,0,0,0,0,0],"y":[-10,-30,-5,35,60,70,85,100,85],"z":[0,-6,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,15,15,20,20,15,15,5,0],"texture":[6,4,63,4,63,18,4,17]}},"wings":{"main":{"length":[20,70,35],"width":[50,55,40,20],"angle":[0,-20,0],"position":[20,20,70,25],"texture":[3,18,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":0,"y":0,"z":13}},"spoiler":{"length":[20,45,0,5],"width":[40,40,20,30,0],"angle":[0,20,90,90],"position":[60,60,80,80,90],"texture":[10,11,63],"doubleside":true,"bump":{"position":30,"size":18},"offset":{"x":0,"y":0,"z":30}},"font":{"length":[37],"width":[40,15],"angle":[-10],"position":[0,-45],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":35,"y":-20,"z":10}},"shields":{"doubleside":true,"offset":{"x":12,"y":60,"z":-15},"length":[0,15,45,20],"width":[30,30,65,65,30,30],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[4],"bump":{"position":0,"size":4}}},"typespec":{"name":"Marauder","level":7,"model":3,"code":703,"specs":{"shield":{"capacity":[350,350],"reload":[11,11]},"generator":{"capacity":[140,140],"reload":[1e+300,1e+300]},"ship":{"mass":1000,"speed":[0.00001,0.00001],"rotation":[0.00001,0.00001],"acceleration":[150,150]}},"shape":[2.856,3.818,3.916,3.768,3.144,2.745,3.053,2.937,2.387,1.832,1.604,1.479,1.384,3.652,3.741,3.772,3.685,3.627,3.684,3.73,3.408,3.216,3.284,3.154,2.717,2.405,2.717,3.154,3.284,3.216,3.408,3.73,3.684,3.627,3.685,3.772,3.741,3.652,1.384,1.479,1.604,1.832,2.387,2.937,3.053,2.745,3.144,3.768,3.916,3.818],"lasers":[{"x":0,"y":-2.85,"z":0.3,"angle":0,"damage":[30,30],"rate":10,"type":1,"speed":[130,130],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.85,"z":0.3,"angle":0,"damage":[50,50],"rate":10,"type":1,"speed":[0.01,0.01],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.9,"y":-3.75,"z":-0.3,"angle":0,"damage":[30,30],"rate":10,"type":1,"speed":[120,120],"number":1,"spread":2.5,"error":0,"recoil":0},{"x":-0.9,"y":-3.75,"z":-0.3,"angle":0,"damage":[30,30],"rate":10,"type":1,"speed":[120,120],"number":1,"spread":2.5,"error":0,"recoil":0}],"radius":3.916}}'
        },
        name: "Deathray",
        cooldown: 36 * 60,
        duration: 2 * 60,
        endOnDeath: true,
        start: function (ship) {
            ship.set({generator:0,type:this.codes.ability,vx:0,vy:0,invulnerable:100, stats: AbilityManager.maxStats});
        }
    },
    "Condor": {
        models: {
            default: '{"name":"Condor","remodel":"Nex","level":6,"model":4,"size":1.55,"specs":{"shield":{"capacity":[225,400],"reload":[7,11]},"generator":{"capacity":[70,130],"reload":[30,50]},"ship":{"mass":222,"speed":[75,106],"rotation":[50,70],"acceleration":[80,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-110,-95,-100,-100,-45,-40,-25,-23,15,20,55,60,80,100,90],"z":[-10,-9,-8,-7,-6,-4,-2,0,0,0,0,0,0,0,0]},"width":[0,2,5,10,25,27,27,25,25,28,28,26,27,22,0],"height":[0,2,5,10,25,27,27,25,25,27,26,20,15,10,0],"texture":[6,2,3,10,5,63,5,8,5,2,5,63,12,4],"propeller":true,"laser":{"damage":[70,70],"rate":2.5,"type":2,"speed":[230,230],"number":1,"angle":0,"error":0}},"main3":{"section_segments":12,"offset":{"x":0,"y":-5,"z":0},"position":{"x":[0,0],"y":[100,90],"z":[0,0]},"width":[15,0],"height":[10,0],"texture":[12,4],"propeller":true},"cannons":{"section_segments":12,"offset":{"x":70,"y":25,"z":-20},"position":{"x":[0,0,0,0,0,-4,-5],"y":[-53,-44,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,4,10,10,10,8,0],"height":[0,5,15,15,10,5,0],"angle":1,"laser":{"damage":[6,6],"rate":3,"type":1,"speed":[130,130],"number":1,"angle":0,"error":0},"propeller":false,"texture":[17,4,10,4,63,4]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-60,"z":8},"position":{"x":[0,0,0,0],"y":[-20,-8,20,65],"z":[0,-2,0,0]},"width":[0,6,12,0],"height":[0,12,15,5],"texture":[9]},"side_propulsors":{"section_segments":10,"offset":{"x":30,"y":-10,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,10,0],"propeller":true,"texture":[4,4,2,2,5,63,5,4,12]}},"wings":{"back":{"offset":{"x":0,"y":25,"z":10},"length":[80,30],"width":[70,50,30],"angle":[-30,40],"position":[0,20,0],"texture":[3,63],"doubleside":true,"bump":{"position":10,"size":20}},"front":{"offset":{"x":0,"y":55,"z":10},"length":[80,30],"width":[70,50,30],"angle":[-30,-40],"position":[-60,-20,-20],"texture":[11,63],"doubleside":true,"bump":{"position":10,"size":10}}},"typespec":{"name":"Condor","level":6,"model":4,"code":604,"specs":{"shield":{"capacity":[225,400],"reload":[7,11]},"generator":{"capacity":[70,130],"reload":[30,50]},"ship":{"mass":222,"speed":[75,106],"rotation":[50,70],"acceleration":[80,120]}},"shape":[3.41,3.115,2.532,2.024,1.713,1.526,1.329,1.399,1.449,2.311,2.346,2.367,2.427,2.882,2.952,3.076,3.253,3.234,3.21,3.284,3.217,2.492,2.661,3.174,3.156,3.106,3.156,3.174,2.661,2.492,3.217,3.284,3.21,3.234,3.253,3.076,2.952,2.882,2.427,2.367,2.346,2.311,1.449,1.399,1.329,1.526,1.713,2.024,2.532,3.115],"lasers":[{"x":0,"y":-3.41,"z":0,"angle":0,"damage":[70,70],"rate":2.5,"type":2,"speed":[230,230],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.141,"y":-0.868,"z":-0.62,"angle":1,"damage":[6,6],"rate":3,"type":1,"speed":[130,130],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.141,"y":-0.868,"z":-0.62,"angle":-1,"damage":[6,6],"rate":3,"type":1,"speed":[130,130],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.41}}',
            ability: '{"name":"Condor","level":7,"model":4,"size":1.58,"specs":{"shield":{"capacity":[450,450],"reload":[15,15]},"generator":{"capacity":[160,160],"reload":[64,64]},"ship":{"mass":380,"speed":[110,110],"rotation":[80,80],"acceleration":[120,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-110,-95,-100,-100,-45,-40,-25,-23,15,20,55,60,80,100,90],"z":[-10,-9,-8,-7,-6,-4,-2,0,0,0,0,0,0,0,0]},"width":[0,2,5,10,25,27,27,25,25,28,28,26,27,22,0],"height":[0,2,5,10,25,27,27,25,25,27,26,20,15,10,0],"texture":[6,2,3,10,5,63,5,8,5,2,5,63,12,4],"propeller":true,"laser":{"damage":[100,100],"rate":2,"type":2,"speed":[250,250],"number":1,"angle":0,"error":0}},"main2":{"section_segments":12,"offset":{"x":0,"y":0,"z":1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-45,-40,-25,-23,15,20,55,60,80,100],"z":[-7,-6,-4,-2,0,0,0,0,0,0,0]},"width":[2.5,6,6,6,6,6,6,6,5,4,2],"height":[10,25,27,27,25,25,27,26,20,15,10],"texture":[5],"propeller":1},"main3":{"section_segments":12,"offset":{"x":0,"y":-5,"z":0},"position":{"x":[0,0],"y":[100,90],"z":[0,0]},"width":[15,0],"height":[10,0],"texture":[12,4],"propeller":true},"cannons":{"section_segments":12,"offset":{"x":70,"y":25,"z":-20},"position":{"x":[0,0,0,0,0,-4,-5],"y":[-53,-44,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,4,10,10,10,8,0],"height":[0,5,15,15,10,5,0],"angle":2,"laser":{"damage":[8,8],"rate":4,"type":1,"speed":[160,160],"number":1,"angle":0,"error":0},"propeller":false,"texture":[17,4,10,4,63,4]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-60,"z":8},"position":{"x":[0,0,0,0],"y":[-20,-8,20,65],"z":[0,-2,0,0]},"width":[0,6,12,0],"height":[0,12,15,5],"texture":[5]},"side_propulsors":{"section_segments":10,"offset":{"x":30,"y":-10,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,10,0],"propeller":true,"texture":[4,4,2,2,5,63,5,4,12]}},"wings":{"back":{"offset":{"x":0,"y":25,"z":10},"length":[80,30],"width":[70,50,30],"angle":[-30,40],"position":[0,20,0],"texture":[3,63],"doubleside":true,"bump":{"position":10,"size":20}},"front":{"offset":{"x":0,"y":55,"z":10},"length":[80,30],"width":[70,50,30],"angle":[-30,-40],"position":[-60,-20,-20],"texture":[11,63],"doubleside":true,"bump":{"position":10,"size":10}}},"typespec":{"name":"Condor","level":7,"model":4,"code":704,"specs":{"shield":{"capacity":[450,450],"reload":[15,15]},"generator":{"capacity":[160,160],"reload":[64,64]},"ship":{"mass":380,"speed":[110,110],"rotation":[80,80],"acceleration":[120,120]}},"shape":[3.476,3.176,2.581,2.064,1.746,1.555,1.354,1.426,1.477,2.33,2.368,2.395,2.463,2.938,3.009,3.135,3.316,3.297,3.304,3.365,3.247,2.54,2.712,3.236,3.217,3.166,3.217,3.236,2.712,2.54,3.247,3.365,3.304,3.297,3.316,3.135,3.009,2.938,2.463,2.395,2.368,2.33,1.477,1.426,1.354,1.555,1.746,2.064,2.581,3.176],"lasers":[{"x":0,"y":-3.476,"z":0,"angle":0,"damage":[100,100],"rate":2,"type":2,"speed":[250,250],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.154,"y":-0.884,"z":-0.632,"angle":2,"damage":[8,8],"rate":4,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.154,"y":-0.884,"z":-0.632,"angle":-2,"damage":[8,8],"rate":4,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.476}}',
        },
        name: "Berserk",
        cooldown: 45 * 60,
        duration: 15 * 60,
        endOnDeath: true,
        start: function (ship) {
            ship.set({generator:1000,type:this.codes.ability,stats:AbilityManager.maxStats,invulnerable:100});
        }
    },
    "A-Speedster": {
        models: {
            default: '{"name":"A-Speedster","remodel":"Nex","level":6,"model":5,"size":1.5,"specs":{"shield":{"capacity":[200,300],"reload":[6,8]},"generator":{"capacity":[80,140],"reload":[37,47]},"ship":{"mass":200,"speed":[90,135],"rotation":[60,80],"acceleration":[90,140]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0],"y":[-100,-95,0,5],"z":[0,0,0,0]},"width":[0,10,40,0],"height":[0,5,30,0],"texture":[6,11,4],"laser":{"damage":[38,84],"rate":1,"type":2,"speed":[175,230],"recoil":50,"number":1,"error":0}},"warp_drive":{"section_segments":12,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-22,-22,-8,-2,-3,2,1,40,40,45,60,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,30,25,23,21,21,13,13,21,23,25,18,0],"height":[0,25,25,23,21,21,13,13,21,23,25,18,0],"propeller":1,"texture":[4,13,4,8,4,17,17,18,4,12,8,17],"vertical":0,"angle":0},"side_connector":{"section_segments":12,"offset":{"x":20,"y":-20,"z":-40},"position":{"x":[-9,-9,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-27,-27,-3,0,-1,4,3,15,15,20,25,25],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,18,16,16,13,12,16,18,20,0],"height":[0,20,20,18,16,16,13,12,16,18,20,0],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12,4],"vertical":1,"angle":70},"struts":{"section_segments":12,"offset":{"x":15,"y":50,"z":0},"position":{"x":[0,0,0,0],"y":[-50,-20,40,40],"z":[0,0,0,0]},"width":[2,4,4,2],"height":[2,5,5,2],"angle":0,"propeller":false,"texture":4},"struts2":{"section_segments":12,"offset":{"x":0,"y":50,"z":10},"position":{"x":[0,0,0,0],"y":[-50,-20,40,40],"z":[0,0,0,0]},"width":[2,4,4,2],"height":[2,5,5,2],"angle":0,"propeller":false,"texture":4},"cookring1":{"section_segments":8,"offset":{"x":0,"y":55,"z":0},"position":{"x":[0,0,0,0],"y":[-4,-4,0,0],"z":[0,0,0,0]},"width":[0,18,18,0],"height":[0,18,18,0],"texture":[4],"propeller":false},"cookring2":{"section_segments":8,"offset":{"x":0,"y":45,"z":0},"position":{"x":[0,0,0,0],"y":[-4,-4,0,0],"z":[0,0,0,0]},"width":[0,18,18,0],"height":[0,18,18,0],"texture":[4],"propeller":false},"cookring3":{"section_segments":8,"offset":{"x":0,"y":35,"z":0},"position":{"x":[0,0,0,0],"y":[-4,-4,0,0],"z":[0,0,0,0]},"width":[0,18,18,0],"height":[0,18,18,0],"texture":[4],"propeller":false},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,40,50],"z":[-7,-5,0,0,0]},"width":[0,6,10,12,0],"height":[0,10,15,12,0],"texture":[9]},"side_propulsors":{"section_segments":10,"offset":{"x":50,"y":25,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,60,65,90,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,15,15,20,20,10,10,0],"height":[0,15,20,20,20,15,15,20,20,10,10,0],"propeller":true,"texture":[4,4,2,2,5,63,5,4,17,17,4]},"thruster":{"section_segments":10,"offset":{"x":50,"y":55,"z":-5},"position":{"x":[0,0,0],"y":[10,30,30],"z":[0,0,0]},"width":[18,18,20],"height":[18,18,20],"propeller":true,"texture":[4,17,17,4]},"flame_shield":{"section_segments":[35,55,125,145,215,235,305,325],"offset":{"x":50,"y":80,"z":10},"position":{"x":[0,0,0,0],"y":[-50,-20,40,40],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,5,5,0],"angle":0,"propeller":false,"texture":4},"flame_shield2":{"section_segments":[35,55,125,145,215,235,305,325],"offset":{"x":65,"y":80,"z":-5},"position":{"x":[0,0,0,0],"y":[-50,-20,40,40],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,5,5,0],"angle":0,"propeller":false,"texture":4},"flame_shield3":{"section_segments":[35,55,125,145,215,235,305,325],"offset":{"x":35,"y":80,"z":-5},"position":{"x":[0,0,0,0],"y":[-50,-20,40,40],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,5,5,0],"angle":0,"propeller":false,"texture":4},"flame_shield4":{"section_segments":[35,55,125,145,215,235,305,325],"offset":{"x":50,"y":80,"z":-20},"position":{"x":[0,0,0,0],"y":[-50,-20,40,40],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,5,5,0],"angle":0,"propeller":false,"texture":4},"cookring":{"section_segments":8,"offset":{"x":0,"y":-43,"z":0},"position":{"x":[0,0,0,0],"y":[-10,-8,0,0],"z":[0,0,0,0]},"width":[0,25,30,20],"height":[0,20,22,20],"texture":[63],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":50,"y":40,"z":12},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,5,7,10,3,5,0],"height":[0,5,7,8,3,5,0],"angle":-1,"laser":{"damage":[8,10],"rate":1.5,"type":1,"speed":[120,160],"number":1,"angle":0,"error":0},"propeller":false,"texture":[6,4,10,4,63,4]}},"wings":{"winglets":{"offset":{"x":15,"y":-40,"z":10},"doubleside":true,"length":[25,10],"width":[5,20,30],"angle":[4,-10],"position":[90,80,50],"texture":[4],"bump":{"position":10,"size":30}}},"typespec":{"name":"A-Speedster","level":6,"model":5,"code":605,"specs":{"shield":{"capacity":[200,300],"reload":[6,8]},"generator":{"capacity":[80,140],"reload":[37,47]},"ship":{"mass":200,"speed":[90,135],"rotation":[60,80],"acceleration":[90,140]}},"shape":[3,2.914,2.408,1.952,1.704,1.603,1.349,1.263,1.198,1.163,1.146,1.631,1.682,1.709,2.06,2.227,2.362,2.484,2.832,3.248,3.818,4.142,3.939,3.779,3.048,3.006,3.048,3.779,3.939,4.142,3.818,3.248,2.832,2.484,2.362,2.227,2.06,1.709,1.682,1.631,1.146,1.163,1.198,1.263,1.349,1.603,1.704,1.952,2.408,2.914],"lasers":[{"x":0,"y":-3,"z":0,"angle":0,"damage":[38,84],"rate":1,"type":2,"speed":[175,230],"number":1,"spread":0,"error":0,"recoil":50},{"x":1.526,"y":-0.3,"z":0.36,"angle":-1,"damage":[8,10],"rate":1.5,"type":1,"speed":[120,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.526,"y":-0.3,"z":0.36,"angle":1,"damage":[8,10],"rate":1.5,"type":1,"speed":[120,160],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.142}}'
        },
        name: "Quickdrive",
        cooldown: 6 * 60,
        duration: 0.14 * 60,

        TPDistance: 5,
        speed: 0.7,
        initial_dependency: 1 / 1.5, // addition of part of the initial speed

        start: function (ship) {
            ship.set({
                invulnerable: 120,
                x: ship.x + this.TPDistance * Math.cos(ship.r),
                y: ship.y + this.TPDistance * Math.sin(ship.r),
                collider: false,
            });
            HelperFunctions.accelerate(ship, this.speed, null, this.initial_dependency);
        },
        end: function (ship) { ship.set({collider: true}) }
    },
    "Rock-Tower": {
        models: {
            default: '{"name":"Rock-Tower","remodel":"Nex","level":6,"model":6,"size":2.1,"specs":{"shield":{"capacity":[350,550],"reload":[8,10]},"generator":{"capacity":[10,10],"reload":[250,250]},"ship":{"mass":465,"speed":[110,110],"rotation":[65,65],"acceleration":[90,90]}},"bodies":{"cannons1":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":0},"propeller":false,"texture":[17]},"cannons2":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":0},"propeller":false,"texture":[17]},"cannons3":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":0},"propeller":false,"texture":[17]},"cannons4":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":0},"propeller":false,"texture":[17]},"cannons5":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":0},"propeller":false,"texture":[17]},"cannons6":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":1},"propeller":false,"texture":[17]},"cannons7":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":2},"propeller":false,"texture":[17]},"cannons8":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":4},"propeller":false,"texture":[17]},"cannons9":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":6},"propeller":false,"texture":[17]},"cannons10":{"section_segments":6,"offset":{"x":25,"y":-100,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"error":8},"propeller":false,"texture":[17]},"plow":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-90,-85,-70,-60,-60],"z":[0,0,0,0,0]},"width":[0,40,45,10,0],"height":[0,10,12,8,0],"texture":[4,63,4,4,4]},"main2":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-15,-15,40,85,70],"z":[0,0,0,0,0]},"width":[0,30,30,20,0],"height":[0,10,25,20,0],"texture":[4,11,10,12],"propeller":true},"side_connector":{"section_segments":12,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-32,-15,-12,-13,-8,-9,15,15,20,25,25],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,19,19,17,15,15,10,9,15,17,19,0],"height":[0,9,9,7,5,5,5,5,13,15,17,0],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12,4],"angle":0},"Noels_cookgun":{"section_segments":8,"offset":{"x":25,"y":-120,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[15,8,23,27,62,62,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,7,4,4,7,7],"height":[0,5,5,7,7,4,4,7,7],"texture":[12,13,4,8,4,4,3,8],"propeller":false},"cookring1":{"section_segments":8,"offset":{"x":25,"y":60,"z":20},"position":{"x":[0,0,0,0],"y":[-3,-3,3,3],"z":[0,0,0,0]},"width":[12,15,15,12],"height":[12,15,15,12],"texture":[63],"propeller":false,"angle":-15},"cookring2":{"section_segments":8,"offset":{"x":30,"y":40,"z":20},"position":{"x":[0,0,0,0],"y":[-3,-3,3,3],"z":[0,0,0,0]},"width":[12,15,15,12],"height":[12,15,15,12],"texture":[63],"propeller":false,"angle":0},"barrelrings":{"vertical":1,"section_segments":6,"offset":{"x":30,"y":-5,"z":-10},"position":{"x":[0,0,0,0,0],"y":[-5,0,0,-5,-5],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[25,25,20,20,25],"texture":[63]},"propulsors":{"section_segments":8,"offset":{"x":30,"y":50,"z":0},"position":{"x":[0,0,5,5,0,0,0],"y":[-45,-50,-20,0,20,50,40],"z":[0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,0],"height":[0,15,20,25,20,10,0],"texture":[11,2,3,4,5,12],"angle":0,"propeller":true},"cockpit_SUPPORT":{"section_segments":6,"offset":{"x":0,"y":75,"z":25},"position":{"x":[0,0,0,0,0],"y":[-35,-41,-30,-10,0],"z":[0,0,0,0,0]},"width":[0,15,15,15,10],"height":[0,14,15,15,10],"texture":[4,3,8,4],"propeller":false}},"wings":{"main":{"length":[55,15],"width":[60,40,30],"angle":[-10,20],"position":[30,40,30],"texture":63,"doubleside":true,"offset":{"x":0,"y":20,"z":-5},"bump":{"position":30,"size":20}},"finalizer_fins":{"length":[20],"width":[20,10],"angle":[-70],"position":[-42,-30],"texture":63,"doubleside":true,"offset":{"x":35,"y":-35,"z":5},"bump":{"position":0,"size":30}},"wings_are_better_than_bodies_proof":{"offset":{"x":0,"y":20,"z":24},"length":[10,-2],"width":[40,30,30],"angle":[-10,0,0],"position":[-5,0,0],"texture":[9,7,4],"doubleside":true,"bump":{"position":5,"size":30}},"exactly":{"offset":{"x":0,"y":30,"z":36.5},"length":[14],"width":[20,15],"angle":[-23],"position":[-5,0],"texture":[9,7,4],"doubleside":true,"bump":{"position":5,"size":5}}},"typespec":{"name":"Rock-Tower","level":6,"model":6,"code":606,"specs":{"shield":{"capacity":[350,550],"reload":[8,10]},"generator":{"capacity":[10,10],"reload":[250,250]},"ship":{"mass":465,"speed":[110,110],"rotation":[65,65],"acceleration":[90,90]}},"shape":[3.78,4.789,4.87,4.202,3.946,3.508,1.906,1.67,1.547,1.53,1.624,1.828,1.99,2.002,2.05,2.134,3.269,3.539,3.933,3.989,4.058,4.127,4.524,4.416,3.634,3.577,3.634,4.416,4.524,4.127,4.058,3.989,3.933,3.539,3.269,2.134,2.05,2.002,1.99,1.828,1.624,1.53,1.547,1.67,1.906,3.508,3.946,4.202,4.87,4.789],"lasers":[{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":4,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":4,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":6,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":6,"recoil":0},{"x":1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":0},{"x":-1.05,"y":-4.2,"z":0,"angle":0,"damage":[10,10],"rate":0.3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":0}],"radius":4.87}}'
        },
        name: "Asteroid",
        cooldown: 18 * 60,
        customEndcondition: true,
        generatorInit: 0,

        asteroidSize: 35,
        frontDistance: 5,
        asteroidSpeed: 2.5,

        start: function (ship) {
            let asteroidSpeed = this.asteroidSpeed + Math.sqrt(ship.vx ** 2 + ship.vy ** 2);
            game.addAsteroid({
                x: ship.x + this.frontDistance * Math.cos(ship.r),
                y: ship.y + this.frontDistance * Math.sin(ship.r),
                vx: asteroidSpeed * Math.cos(ship.r),
                vy: asteroidSpeed * Math.sin(ship.r),
                size: this.asteroidSize
            })
        },

        end: function () {},

        canEnd: function (ship) { return true; }
    },
    "Barracuda": {
        models: {
            default: '{"name":"Barracuda","level":6,"model":7,"size":2.4,"specs":{"shield":{"capacity":[300,400],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[8,14]},"ship":{"mass":675,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"bodies":{"body":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-100,-60,-10,0,20,50,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,20,25,35,40,40,35,30,0],"height":[0,5,40,45,40,60,70,60,30,0],"texture":[10,2,10,2,3,8,13,63,12],"propeller":true},"front":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-20],"z":[0,0,0,0,0]},"width":[0,40,45,10,12],"height":[0,15,18,8,12],"texture":[8,63,4,4,4],"propeller":true},"strut":{"section_segments":12,"offset":{"x":26,"y":-40,"z":0},"position":{"x":[-15,-5,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[2,5,5,2],"height":[2,15,15,2],"angle":0,"propeller":false,"texture":63},"propeller":{"section_segments":10,"offset":{"x":40,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,20,15,0],"height":[0,10,15,15,15,10,10,18,8,0],"texture":[4,4,10,3,3,63,4,63,12],"propeller":true},"sides":{"section_segments":6,"angle":60,"offset":{"x":-5,"y":18,"z":0},"position":{"x":[0,0,0,0],"y":[-80,-75,-60,-60],"z":[0,0,0,0]},"width":[0,30,35,10],"height":[0,15,20,8],"texture":[4,63,4,4]},"side_connector":{"section_segments":12,"offset":{"x":35,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-20,-3,0,-1,4,3,15,15,20,25,25],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,18,16,16,13,12,16,18,20,0],"height":[0,20,20,18,16,16,13,12,16,18,20,0],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12,4],"vertical":0,"angle":120},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,0,10,30,50],"z":[0,0,0,0,0,0]},"width":[0,10,16,18,10,0],"height":[0,20,22,24,20,0],"texture":[9]}},"wings":{"top":{"doubleside":true,"offset":{"x":0,"y":20,"z":15},"length":[80],"width":[70,30],"angle":[70],"position":[0,30],"texture":[63],"bump":{"position":10,"size":30}},"top2":{"doubleside":true,"offset":{"x":0,"y":51,"z":5},"length":[80],"width":[50,20],"angle":[60],"position":[0,60],"texture":[63],"bump":{"position":10,"size":30}},"shields":{"doubleside":true,"offset":{"x":45,"y":45,"z":-22.5},"length":[0,10,30,10],"width":[30,30,65,65,30,30],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[63,63,4,63],"bump":{"position":0,"size":4}}},"typespec":{"name":"Barracuda","level":6,"model":7,"code":607,"specs":{"shield":{"capacity":[300,400],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[8,14]},"ship":{"mass":675,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"shape":[5.28,5.25,5.332,5.393,4.944,2.433,2.106,3.398,3.463,3.586,3.727,3.796,3.927,3.984,3.699,2.802,3.011,3.312,3.662,4.104,5.132,5.888,6.117,6.038,4.886,4.809,4.886,6.038,6.117,5.888,5.132,4.104,3.662,3.312,3.011,2.802,3.699,3.984,3.931,3.796,3.727,3.586,3.463,3.398,2.106,2.433,4.944,5.393,5.332,5.25],"lasers":[],"radius":6.117}}'
        },
        name: "Pull",
        cooldown: 20 * 60,
        duration: 1,

        range: 40,

        showAbilityRangeUI: true,
        includeRingOnModel: true,

        pullStrength: 2,

        start: function (ship) {
            let ships = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true }, true);
            for (let affectedShip of ships) HelperFunctions.accelerateToTarget(affectedShip, ship, this.pullStrength);
        },

        end: function () {}
    },
    "O-Defender": {
        models: {
            default: '{"name":"O-Defender","remodel":"Nex","level":6,"model":8,"size":2.2,"specs":{"shield":{"capacity":[400,555],"reload":[10,12]},"generator":{"capacity":[70,160],"reload":[51,51]},"ship":{"mass":555,"speed":[70,86],"rotation":[30,48],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-93,-93,-90,-28,0,90,98,98,80],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,6,7,10,20,25,10,6,5,0],"height":[0,6,7,10,35,35,20,17,16,0],"texture":[1,17,3,1,4,10,4,17],"propeller":true,"laser":{"damage":[50,50],"rate":10,"type":2,"speed":[150,150],"number":1,"angle":0,"error":0}},"laser1":{"section_segments":12,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[90,90,90,90,90,90,90],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"angle":2,"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"error":0}},"laser2":{"section_segments":12,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[-90,-90,-90,-90,-90,-90,-90],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"angle":2,"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"error":0}},"cookring2":{"section_segments":8,"offset":{"x":85,"y":-10,"z":0},"position":{"x":[0,0,0,0],"y":[-10,-5,5,10],"z":[0,0,0,0]},"width":[12,15,15,12],"height":[12,15,15,12],"texture":[4],"propeller":false,"angle":0},"side_connector":{"section_segments":12,"offset":{"x":29,"y":-5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-20,0,3,-1,4,3,20,20,22,28],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,18,16,16,13,12,16,18,20],"height":[0,20,20,18,16,16,13,12,16,18,20],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12],"vertical":false,"angle":100},"side":{"section_segments":10,"offset":{"x":50,"y":0,"z":0},"position":{"x":[-20,-30,-30,3,-5,15,25,20,0,-40,-30],"y":[-90,-99,-100,-59,-70,-40,-10,20,50,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,10,15,20,20,20,20,20,5,0],"height":[0,14,15,15,25,30,30,30,25,15,0],"texture":[18,17,3,18,63,2,3,4,63,18]},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-67,"z":26},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-4,0,20,40,60,62],"z":[-8,-8,-4,0,0,0]},"width":[0,5,8,12,6,0],"height":[0,5,10,12,12,0],"texture":[8.98,8.98,8.98,8.98,3]},"top_propulsor":{"section_segments":15,"offset":{"x":0,"y":-20,"z":14},"position":{"x":[0,0,0,0,0],"y":[80,79,105,120,110],"z":[0,0,0,0,0]},"width":[0,15,20,14,0],"height":[0,15,10,10,0],"propeller":true,"texture":[18,4,63,12]},"bottom_propulsor":{"section_segments":15,"offset":{"x":0,"y":-20,"z":-14},"position":{"x":[0,0,0,0,0],"y":[80,79,105,120,110],"z":[0,0,0,0,0]},"width":[0,15,20,14,0],"height":[0,15,10,10,0],"propeller":true,"texture":[18,4,63,12]}},"wings":{"join":{"offset":{"x":0,"y":30,"z":0},"length":[40,30],"width":[130,90,90],"angle":[-1,-1],"position":[0,-30,-30],"doubleside":true,"texture":[18,4],"bump":{"position":-20,"size":10}},"top":{"doubleside":true,"offset":{"x":0,"y":10,"z":15},"length":[20],"width":[70,60],"angle":[60],"position":[0,30],"texture":[63],"bump":{"position":10,"size":10}}},"typespec":{"name":"O-Defender","level":6,"model":8,"code":608,"specs":{"shield":{"capacity":[400,555],"reload":[10,12]},"generator":{"capacity":[70,160],"reload":[51,51]},"ship":{"mass":555,"speed":[70,86],"rotation":[30,48],"acceleration":[80,100]}},"shape":[4.1,4.479,4.588,4.514,4.247,4.069,4.174,4.107,4.066,4.468,4.418,4.449,4.435,4.268,4.203,3.966,3.83,3.76,3.742,3.629,3.58,3.641,3.761,4.083,4.442,4.409,4.442,4.083,3.761,3.641,3.58,3.629,3.742,3.76,3.83,4.099,4.188,4.182,4.435,4.449,4.44,4.395,4.066,4.107,4.174,4.069,4.247,4.514,4.588,4.479],"lasers":[{"x":0,"y":-4.092,"z":0,"angle":0,"damage":[50,50],"rate":10,"type":2,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.912,"y":-1.897,"z":0,"angle":2,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.004,"y":-1.621,"z":0,"angle":2,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.588}}',
            ability: '{"name":"Torpedo","level":7,"model":8,"size":1.55,"specs":{"shield":{"capacity":[100,100],"reload":[1,1]},"generator":{"capacity":[69,69],"reload":[69,69]},"ship":{"mass":250,"speed":[100,100],"rotation":[30,30],"acceleration":[100,100]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-90,-80,-25,0,60,80,110,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,20,10,10,0],"height":[0,15,20,20,20,20,10,10,0],"propeller":true,"texture":[13,63,3,10,63,4,12,17]}},"wings":{"main1":{"length":[10,25],"width":[5,30,20],"angle":[45,45],"position":[0,0,0],"doubleside":true,"offset":{"x":0,"y":95,"z":0},"bump":{"position":30,"size":25,"texture":[0]}},"main2":{"length":[10,25],"width":[5,30,20],"angle":[-45,-45],"position":[0,0,0],"doubleside":true,"offset":{"x":0,"y":95,"z":0},"bump":{"position":30,"size":25,"texture":[0]}}},"typespec":{"name":"Torpedo","level":7,"model":8,"code":708,"specs":{"shield":{"capacity":[100,100],"reload":[1,1]},"generator":{"capacity":[69,69],"reload":[69,69]},"ship":{"mass":250,"speed":[100,100],"rotation":[30,30],"acceleration":[100,100]}},"shape":[3.1,2.973,2.702,1.892,1.384,1.1,0.919,0.807,0.728,0.67,0.634,0.608,0.594,0.594,0.608,0.63,0.669,0.728,0.799,0.92,1.086,1.379,1.898,3.353,3.423,3.417,3.423,3.353,1.898,1.379,1.086,0.92,0.799,0.728,0.669,0.63,0.608,0.594,0.594,0.608,0.634,0.67,0.728,0.807,0.919,1.1,1.384,1.892,2.702,2.973],"lasers":[],"radius":3.423}}'
        },
        name: "Torpedo",
        cooldown: 60 * 60,
        duration: 8 * 60,

        detonateCooldown: 3 * 60,

        customEndcondition: true,
        canStartOnAbility: true,
        endOnDeath: true,

        generatorInit: 0,

        torpedoDamage: 800,
        torpedoCenterShockwaveStrength: 800,

        // shockwave strength: strength of the shockwave on center (applying to ship with mass 1 and has distance 0 from torp)
        // used to count pushing speed, relies on those props:
        // ~shockwave strength
        // ~1/distance from torp ship
        // ~1/victim's mass

        canDetonateAutomatically: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.detonateCooldown);
        },

        range: 75,

        endName: "Detonate",
        
        abilityName: function (ship) {
            return ship.custom.inAbility ? this.endName : this.name;
        },

        canStart: function (ship) {
            return ship.custom.inAbility ? this.canDetonateAutomatically(ship) : HelperFunctions.templates.canStart.call(this, ship);
        },

        requirementsText: function (ship) {
            return ship.custom.inAbility ? HelperFunctions.timeLeft(ship.custom.lastTriggered + this.detonateCooldown) : HelperFunctions.templates.requirementsText.call(this, ship);
        },

        start: function (ship, lastStatus) {
            if (lastStatus) ship.custom.forceEnd = true;
            else ship.set({type: this.codes.ability, stats: AbilityManager.maxStats, shield: 1000, generator: 0, crystals: 0});
        },

        end: function (ship) {
            if (ship.custom.ability !== this) return;
            let ships = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true }, true);
            for (let victim of ships) {
                let affectionRatio = 1 - (HelperFunctions.distance(ship, victim).distance / this.range);
                let shipMass = this.shipMasses.get(victim.type) || 1;
                HelperFunctions.damage(victim, affectionRatio * this.torpedoDamage);
                HelperFunctions.accelerateToTarget(victim, ship, affectionRatio * this.torpedoCenterShockwaveStrength / shipMass, true);
            }
            ship.set({type: this.codes.default, kill: true, stats: AbilityManager.maxStats});
        },

        globalTick: function (game) {
            this.shipMasses = new Map();
            for (let i of game.options.ships) {
                let mass = 1, code;
                try {
                    let parsed = JSON.parse(i);
                    mass = parsed.specs.ship.mass;
                    code = parsed.typespec.code;
                } catch (e) {}

                if (code != null) this.shipMasses.set(code, mass);
            }
            this.globalTick = function () {}
        }
    },
    "Contraband": {
        models: {
          default: '{"name":"Contraband","level":6,"model":9,"size":1.7,"zoom":0.85,"specs":{"shield":{"capacity":[190,275],"reload":[6,8]},"generator":{"capacity":[125,180],"reload":[30,42]},"ship":{"mass":170,"speed":[100,125],"rotation":[60,80],"acceleration":[70,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-75,-80,-20,0,15,20,60,65,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,24,26,20,20,20,20,25,12,0],"height":[0,5,25,25,20,15,15,15,20,10,0],"texture":[1,2,4,63,5,10,5,63,4,17],"propeller":true,"laser":{"damage":[100,150],"rate":10,"type":2,"speed":[110,150],"recoil":250,"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-55,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,40,50],"z":[-7,-5,0,0,0]},"width":[0,5,10,10,0],"height":[0,10,15,12,0],"texture":[9]},"side_propulsors":{"section_segments":8,"offset":{"x":35,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,-4,6,15,20,35,40,50,85,75],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,15,15,18,18,10,0],"height":[0,15,20,20,20,15,15,18,16,10,0],"propeller":true,"texture":[4,4,63,3,5,8,5,63,4,17]},"cannons":{"section_segments":12,"offset":{"x":18,"y":65,"z":20},"position":{"x":[0,0,0,0,0],"y":[-50,-45,-20,-5,5],"z":[0,0,0,0,0]},"width":[0,5,7,8,0],"height":[0,5,7,8,0],"angle":0,"laser":{"damage":[4,8],"rate":4,"type":1,"speed":[150,200],"number":1,"error":0},"propeller":false,"texture":[6,4,63,4,63,4]}},"wings":{"join":{"offset":{"x":0,"y":20,"z":0},"length":[37,0],"width":[20,70],"angle":[0],"position":[-95,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":0}},"join2":{"offset":{"x":25,"y":52,"z":0},"length":[35],"width":[10,10],"angle":[0],"position":[0,0,0,50],"texture":[8],"doubleside":1,"bump":{"position":0,"size":0}},"wing1":{"doubleside":true,"offset":{"x":50,"y":52,"z":-36},"length":[0,30,20,30],"width":[0,0,100,100,0],"angle":[110,70,90,110],"position":[0,0,0,0,0],"texture":[63],"bump":{"position":0,"size":5}}},"typespec":{"name":"Contraband","level":6,"model":9,"code":609,"specs":{"shield":{"capacity":[190,275],"reload":[6,8]},"generator":{"capacity":[125,180],"reload":[30,42]},"ship":{"mass":170,"speed":[100,125],"rotation":[60,80],"acceleration":[70,120]}},"shape":[2.89,2.734,2.209,1.867,1.677,1.545,1.453,1.395,1.363,1.357,1.349,1.298,1.267,2.083,2.16,2.283,2.457,2.721,2.994,3.341,3.851,4.028,4.041,3.932,3.424,3.407,3.424,3.932,4.041,4.028,3.851,3.341,2.994,2.721,2.457,2.283,2.16,2.083,1.267,1.298,1.349,1.357,1.363,1.395,1.453,1.545,1.677,1.867,2.209,2.734],"lasers":[{"x":0,"y":-2.72,"z":0,"angle":0,"damage":[100,150],"rate":10,"type":2,"speed":[110,150],"number":1,"spread":0,"error":0,"recoil":250},{"x":0.612,"y":0.51,"z":0.68,"angle":0,"damage":[4,8],"rate":4,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.612,"y":0.51,"z":0.68,"angle":0,"damage":[4,8],"rate":4,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.041}}'
        },
        name: "Discharge",
        cooldown: 13 * 60,
        customEndcondition: true,

        start: function (ship) {
            ship.set({generator:200});
        },
        
        end: function () {},

        canEnd: function () { return true; }
    },
    "Paradox": {
        models: {
            default: '{"name":"Paradox","designer":"Supernova","level":6,"model":10,"size":2.2,"zoom":0.9,"specs":{"shield":{"capacity":[180,180],"reload":[5,5]},"generator":{"capacity":[250,250],"reload":[40,40]},"ship":{"mass":150,"speed":[250,250],"rotation":[40,40],"acceleration":[50,50]}},"bodies":{"front":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-95,-90,-60,-30,0,30,50,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,10,20,25,30,30,20,0],"height":[0,10,15,20,20,20,15,0],"texture":[15.9,2,18.01,63,11,10,12],"propeller":false,"laser":{"damage":[10,10],"rate":1,"type":2,"speed":[150,150],"number":25,"error":0,"recoil":8}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-75,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[15,35,60,85,95],"z":[-2,1,5,10,18]},"width":[5,7,15,10,5],"height":[0,12,15,15,0],"texture":[8.98,8.98,4,3],"laser":{"damage":[259,250],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"recoil":0}},"cockpit_base":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-20,0,20,50],"z":[0,0,0,0,0]},"width":[20,25,20,10,0],"height":[0,18,25,18,0],"texture":[4,4,4,4],"propeller":false},"cockpit_base2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-0.1,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-20,0,27.5,50],"z":[0,0,2.5,0.5,0,0,0]},"width":[17.5,20,18,10,0],"height":[0,18,25,28,0],"texture":[63,8,4,63],"propeller":false},"side_propulsors":{"section_segments":4,"offset":{"x":13,"y":0,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-10,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,-5,-10,-10,-10]},"width":[0,15,20,20,20,15,15,20,10,0],"height":[0,15,20,20,20,15,15,20,15,0],"propeller":false,"texture":[12,63,2,4,63,5,63,4,17]},"side_side_propulsors":{"section_segments":0,"offset":{"x":13,"y":50,"z":-20},"position":{"x":[0],"y":[50],"z":[0]},"width":[20],"height":[15],"propeller":true},"uwings2":{"section_segments":8,"offset":{"x":20,"y":-50,"z":-5},"position":{"x":[-10,-2,0,0,-2,-10],"y":[-30,-20,-15,15,20,30],"z":[0,0,0,0,0,0]},"width":[0,3,3,3,3,0],"height":[0,2,5,5,2,0],"texture":[4,5,8,5,4,4],"angle":8},"topdeco1":{"section_segments":20,"offset":{"x":0,"y":-5.5,"z":-62},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,-10,0,10,15,20,15],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,10,10,10,10,12.5,10,0],"height":[5,10,10,10,10,12.5,10,0],"texture":[5,63,63,63,63,13,17],"propeller":false,"vertical":true},"topdeco2":{"section_segments":20,"offset":{"x":0,"y":2.5,"z":-35},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,-10,0,10,15,20,15],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,10,10,10,10,12.5,10,0],"height":[5,10,10,10,10,12.5,10,0],"texture":[5,63,63,63,63,13,17],"propeller":false,"vertical":true}},"wings":{"spoiler":{"doubleside":true,"length":[20,25,25,10],"width":[35,35,28,45,30],"angle":[0,5,-65,-160],"position":[-12,-12,-8,-10,-30],"texture":[3.3,10,12,4],"bump":{"position":30,"size":10},"offset":{"x":0,"y":100,"z":35}},"top_supports":{"length":[0,5,15],"width":[0,20,30,20],"angle":[0,80,30],"position":[0,10,10,25],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":45,"y":80,"z":35}},"support":{"doubleside":true,"offset":{"x":16,"y":40,"z":-5},"length":[0,40,0],"width":[35,35,20,20],"angle":[90,90,90],"position":[0,0,50,50,50,50],"texture":[63],"bump":{"position":-20,"size":10}},"wingies":{"doubleside":true,"offset":{"x":10,"y":30,"z":-5},"length":[28],"width":[25,15],"angle":[0],"position":[0,10],"texture":[63],"bump":{"position":-20,"size":10}}},"typespec":{"name":"Paradox","level":6,"model":10,"code":610,"specs":{"shield":{"capacity":[180,180],"reload":[5,5]},"generator":{"capacity":[250,250],"reload":[40,40]},"ship":{"mass":150,"speed":[250,250],"rotation":[40,40],"acceleration":[50,50]}},"shape":[4.18,4.01,3.264,2.98,2.382,2.013,1.274,1.147,1.182,1.276,1.328,1.375,1.45,1.463,1.498,1.561,1.656,1.698,2.293,3.569,4.626,5.684,5.363,4.892,4.725,4.651,4.725,4.892,5.363,5.684,4.626,3.569,2.293,1.698,1.656,1.561,1.498,1.463,1.452,1.375,1.328,1.276,1.182,1.147,1.274,2.013,2.382,2.98,3.264,4.01],"lasers":[{"x":0,"y":-4.18,"z":-0.22,"angle":0,"damage":[10,10],"rate":1,"type":2,"speed":[150,150],"number":25,"spread":0,"error":0,"recoil":8},{"x":0,"y":-2.64,"z":0.308,"angle":0,"damage":[259,250],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":5.684}}',
            ability: '{"name":"Turbodisc","designer":"Supernova","level":7,"model":10,"size":2.2,"zoom":0.9,"specs":{"shield":{"capacity":[400,400],"reload":[20,20]},"generator":{"capacity":[2000,2000],"reload":[0.0001,0.0001]},"ship":{"mass":200,"speed":[250,250],"rotation":[40,40],"acceleration":[50,50]}},"bodies":{"pooper":{"section_segments":0,"offset":{"x":0,"y":25,"z":-25},"position":{"x":[0,0],"y":[-40,-50],"z":[0,0]},"width":[0,5],"height":[0,5],"angle":180,"laser":{"damage":[6,6],"rate":0.1,"type":1,"speed":[300,300],"number":10,"error":120}},"pooper2":{"section_segments":0,"offset":{"x":0,"y":25,"z":-25},"position":{"x":[0,0],"y":[-40,-50],"z":[0,0]},"width":[0,5],"height":[0,5],"angle":180,"laser":{"damage":[15,15],"rate":0.1,"type":1,"speed":[250,250],"number":10,"error":90}},"pooper3":{"section_segments":0,"offset":{"x":0,"y":25,"z":-25},"position":{"x":[0,0],"y":[-40,-50],"z":[0,0]},"width":[0,5],"height":[0,5],"angle":180,"laser":{"damage":[100,100],"rate":0.1,"type":1,"speed":[150,150],"number":10,"error":60,"recoil":0}},"thechewinggum":{"section_segments":0,"offset":{"x":0,"y":25,"z":-25},"position":{"x":[0,0],"y":[-40,-50],"z":[0,0]},"width":[0,5],"height":[0,5],"angle":180,"laser":{"damage":[0.1,0.1],"rate":0.1,"type":1,"speed":[1,1],"number":1,"error":120,"recoil":2000}},"front":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-95,-90,-60,-30,0,30,50,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,10,20,25,30,30,20,0],"height":[0,10,15,20,20,20,15,0],"texture":[15.9,2,18.01,63,11,10,12],"propeller":false},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-75,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[15,35,60,85,95],"z":[-2,1,5,10,18]},"width":[5,7,15,10,5],"height":[0,12,15,15,0],"texture":[5,17,5,4]},"cockpit_base":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-20,0,20,50],"z":[0,0,0,0,0]},"width":[20,25,20,10,0],"height":[0,18,25,18,0],"texture":[4,4,4,4],"propeller":false},"cockpit_base2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-0.1,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-20,0,27.5,50],"z":[0,0,2.5,0.5,0,0,0]},"width":[17.5,20,18,10,0],"height":[0,18,25,28,0],"texture":[63,8,4,63],"propeller":false},"side_propulsors":{"section_segments":6,"offset":{"x":10,"y":5,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-10,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,-5,-10,-10,-10]},"width":[0,15,20,20,20,15,15,20,10,0],"height":[0,15,20,20,20,15,15,20,15,0],"propeller":false,"texture":[12,63,2,4,63,5,63,4,17]},"side_side_propulsors":{"section_segments":0,"offset":{"x":10,"y":50,"z":-5},"position":{"x":[0],"y":[50],"z":[0]},"width":[20],"height":[15],"propeller":true},"uwings2":{"section_segments":8,"offset":{"x":20,"y":-50,"z":-5},"position":{"x":[-10,-2,0,0,-2,-10],"y":[-30,-20,-15,15,20,30],"z":[0,0,0,0,0,0]},"width":[0,3,3,3,3,0],"height":[0,2,5,5,2,0],"texture":[4,5,8,5,4,4],"angle":8},"topdeco1":{"section_segments":20,"offset":{"x":0,"y":-5.5,"z":-62},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,-10,0,10,15,20,15],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,10,10,10,10,12.5,10,0],"height":[5,10,10,10,10,12.5,10,0],"texture":[5,63,63,63,63,13,17],"propeller":false,"vertical":true},"topdeco2":{"section_segments":20,"offset":{"x":0,"y":2.5,"z":-35},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,-10,0,10,15,20,15],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,10,10,10,10,12.5,10,0],"height":[5,10,10,10,10,12.5,10,0],"texture":[5,63,63,63,63,13,17],"propeller":false,"vertical":true}},"wings":{"spoiler":{"doubleside":true,"length":[20,20,15,10],"width":[35,35,28,30,30],"angle":[0,5,-75,-140],"position":[-12,-12,-8,-10,-30],"texture":[3.3,10,12,4],"bump":{"position":30,"size":10},"offset":{"x":0,"y":100,"z":35}},"top_supports":{"length":[0,5,10],"width":[0,20,30,20],"angle":[0,80,30],"position":[0,10,10,25],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":40,"y":80,"z":35}},"support":{"doubleside":true,"offset":{"x":16,"y":40,"z":-5},"length":[0,40,0],"width":[35,35,20,20],"angle":[90,90,90],"position":[0,0,50,50,50,50],"texture":[63],"bump":{"position":-20,"size":10}}},"typespec":{"name":"Turbodisc","level":7,"model":10,"code":710,"specs":{"shield":{"capacity":[400,400],"reload":[20,20]},"generator":{"capacity":[2000,2000],"reload":[0.0001,0.0001]},"ship":{"mass":200,"speed":[250,250],"rotation":[40,40],"acceleration":[50,50]}},"shape":[4.18,4.01,3.264,2.98,2.382,2.013,1.274,1.147,1.061,0.998,1.003,1.057,1.105,1.179,1.241,1.293,1.371,1.485,1.63,1.651,3.117,5.116,5.509,4.897,4.725,4.651,4.725,4.897,5.509,5.116,3.117,1.651,1.63,1.485,1.371,1.293,1.241,1.179,1.107,1.057,1.003,0.998,1.061,1.147,1.274,2.013,2.382,2.98,3.264,4.01],"lasers":[{"x":0,"y":3.3,"z":-1.1,"angle":180,"damage":[6,6],"rate":0.1,"type":1,"speed":[300,300],"number":10,"spread":0,"error":120,"recoil":0},{"x":0,"y":3.3,"z":-1.1,"angle":180,"damage":[15,15],"rate":0.1,"type":1,"speed":[250,250],"number":10,"spread":0,"error":90,"recoil":0},{"x":0,"y":3.3,"z":-1.1,"angle":180,"damage":[100,100],"rate":0.1,"type":1,"speed":[150,150],"number":10,"spread":0,"error":60,"recoil":0},{"x":0,"y":3.3,"z":-1.1,"angle":180,"damage":[0.1,0.1],"rate":0.1,"type":1,"speed":[1,1],"number":1,"spread":0,"error":120,"recoil":2000}],"radius":5.509}}'
        },
        name: "Overclock",
        cooldown: 23 * 60,
        duration: 3 * 60,
        endOnDeath: true,

        tickInterval: 2 * 60,

        start: function (ship) {
            HelperFunctions.templates.start.call(this, ship);
            ship.custom.abilityCustom.overclocked = false;
        },

        tick: function (ship) {
            if (!ship.custom.abilityCustom.overclocked) {
                ship.set({generator: this.energy_capacities.ability});
                ship.custom.abilityCustom.overclocked = true;
            }
        }
    },
    // the midrange
    "Warthog": {
        models: {
            default: '{"name":"Warthog","designer":"nex","level":6,"model":11,"size":1.47,"zoom":0.82,"specs":{"shield":{"capacity":[250,250],"reload":[8,8]},"generator":{"capacity":[10,10],"reload":[1e+300,1e+300]},"ship":{"mass":152,"speed":[144,144],"rotation":[48,48],"acceleration":[138,138]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":6},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-92,-65,-40,0,25,30,75,80,130,125],"z":[-6,-6,-6,-6,-6,-3,0,0,0,0,0]},"width":[0,6,15,20,20,20,10,10,15,12,0],"height":[0,6,10,13,15,12,10,10,10,11,0,0],"texture":[3,2,4,3,63,4,4,4,3,17],"propeller":1},"gun1":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun2":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun3":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun4":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun5":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun6":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun7":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun8":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun9":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun10":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun11":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun12":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun13":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun14":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun15":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-40,-20,0,20,40],"z":[-1,-3,-1,0,3,2]},"width":[0,6,8,12,10,6],"height":[0,9,14,15,10,6],"texture":[3,9,9,4],"propeller":false},"fuelbarrels":{"section_segments":8,"offset":{"x":13,"y":50,"z":5},"position":{"x":[0,8,10,0,-2,-5,0],"y":[-120,-85,-50,-30,-10,0,12],"z":[0,0,0,-5,-6,-3,-3]},"width":[0,10,10,10,10,10,0],"height":[0,10,10,10,10,10,0],"texture":[3,4,63,1,4,4,2,13,17,3],"propeller":false},"turbines":{"section_segments":12,"offset":{"x":25,"y":-75,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[20,25,20,25,35,75,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,8,12,14,12,10,0],"height":[0,4,6,8,10,10,8,0],"texture":[13,3,63,63,10,13,17],"propeller":true},"turbines2":{"section_segments":12,"offset":{"x":25,"y":-15,"z":-1},"position":{"x":[0,0,0],"y":[10,20,30],"z":[0,0,0]},"width":[0,4,10],"height":[0,4,10],"texture":[13,3,63],"propeller":true},"missiles":{"section_segments":4,"offset":{"x":70,"y":0,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-20,-12,15,22.5,30,50,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,6,7,5,7,7,0],"height":[0,4,6,7,5,7,7,0],"texture":[2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4],"angle":0},"missiles2":{"section_segments":4,"offset":{"x":57.5,"y":-10,"z":-2},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-20,-12,15,22.5,30,50,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,6,7,5,7,7,0],"height":[0,4,6,7,5,7,7,0],"texture":[2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4],"angle":0},"missiles3":{"section_segments":4,"offset":{"x":45,"y":-20,"z":4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-20,-12,15,22.5,30,50,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,6,7,5,7,7,0],"height":[0,4,6,7,5,7,7,0],"texture":[2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4],"angle":0}},"wings":{"mein":{"offset":{"x":10,"y":-30,"z":-5},"length":[40,30,15],"width":[80,60,45,40],"angle":[25,-30,30],"position":[-10,40,50,40],"texture":[18,4,63],"doubleside":true,"bump":{"position":20,"size":5}},"mein2":{"offset":{"x":10,"y":-30,"z":-1},"length":[40,30],"width":[40,20,15],"angle":[25,-30],"position":[-10,40,50],"texture":[63,63],"doubleside":true,"bump":{"position":0,"size":0}},"spine":{"length":[25,25],"width":[30,40,30],"angle":[90,90],"position":[0,0,20],"doubleside":true,"texture":[18,63],"offset":{"x":0,"y":90,"z":0},"bump":{"position":30,"size":12}},"winglets":{"offset":{"x":0,"y":95,"z":5},"length":[15,15,10],"width":[35,35,25,25],"angle":[0,-10,40],"position":[-10,-10,0,10],"texture":[3,4,63],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Warthog","level":6,"model":11,"code":611,"specs":{"shield":{"capacity":[250,250],"reload":[8,8]},"generator":{"capacity":[10,10],"reload":[1e+300,1e+300]},"ship":{"mass":152,"speed":[144,144],"rotation":[48,48],"acceleration":[138,138]}},"shape":[3.298,3.22,2.447,1.937,1.886,2.205,2.116,2.24,2.37,2.357,2.285,2.262,2.523,2.524,2.585,2.656,2.606,2.699,2.501,1.073,1.184,1.391,3.556,3.626,3.253,3.675,3.253,3.626,3.556,1.391,1.184,1.073,2.501,2.699,2.606,2.656,2.585,2.524,2.523,2.262,2.285,2.357,2.37,2.24,2.116,2.205,1.886,1.937,2.447,3.22],"lasers":[{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[10,10],"rate":0.2,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6}],"radius":3.675}}',
            ability: '{"name":"Warthog","designer":"nex","level":7,"model":11,"size":1.47,"zoom":0.75,"specs":{"shield":{"capacity":[270,270],"reload":[15,15]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":250,"speed":[40,40],"rotation":[60,60],"acceleration":[120,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":6},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-92,-65,-40,0,25,30,75,80,130,125],"z":[-6,-6,-6,-6,-6,-3,0,0,0,0,0]},"width":[0,6,15,20,20,20,10,10,15,12,0],"height":[0,6,10,13,15,12,10,10,10,11,0,0],"texture":[3,2,4,3,63,4,4,4,3,17],"propeller":1,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun1":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun2":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun3":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun4":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun5":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun6":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun7":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun8":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun9":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun10":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun11":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun12":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun13":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun14":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"gun15":{"section_segments":8,"offset":{"x":1,"y":-40,"z":0},"position":{"x":[0,0],"y":[-60,-70],"z":[0,0]},"width":[0,5],"height":[0,5],"texture":[6],"propeller":false,"angle":1.5,"laser":{"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"error":6.5,"angle":0,"recoil":6}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-40,-20,0,20,40],"z":[-1,-3,-1,0,3,2]},"width":[0,6,8,12,10,6],"height":[0,9,14,15,10,6],"texture":[3,5,17,4,4],"propeller":false},"turbines":{"section_segments":12,"offset":{"x":25,"y":-75,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[20,25,20,25,35,75,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,8,12,14,12,10,0],"height":[0,4,6,8,10,10,8,0],"texture":[13,3,63,63,10,13,17],"propeller":true},"turbines2":{"section_segments":12,"offset":{"x":25,"y":-15,"z":-1},"position":{"x":[0,0,0],"y":[10,20,30],"z":[0,0,0]},"width":[0,4,10],"height":[0,4,10],"texture":[13,3,63],"propeller":true},"fuelbarrels":{"section_segments":8,"offset":{"x":13,"y":50,"z":5},"position":{"x":[0,8,10,0,-2,-5,0],"y":[-120,-85,-50,-30,-10,0,12],"z":[0,0,0,-5,-6,-3,-3]},"width":[0,10,10,10,10,10,0],"height":[0,10,10,10,10,10,0],"texture":[3,4,63,3,4,4,2,13,17,3],"propeller":false},"missiles":{"section_segments":4,"offset":{"x":80,"y":-7,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-20,-12,15,22.5,30,50,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,6,7,5,7,7,0],"height":[0,4,6,7,5,7,7,0],"texture":[2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4],"propeller":1,"angle":0},"missiles2":{"section_segments":4,"offset":{"x":65,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-20,-12,15,22.5,30,50,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,6,7,5,7,7,0],"height":[0,4,6,7,5,7,7,0],"texture":[2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4],"propeller":1,"angle":0},"missiles3":{"section_segments":4,"offset":{"x":50,"y":-20,"z":5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-20,-12,15,22.5,30,50,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,6,7,5,7,7,0],"height":[0,4,6,7,5,7,7,0],"texture":[2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4],"propeller":1,"angle":0}},"wings":{"mein":{"offset":{"x":10,"y":-30,"z":-5},"length":[50,35,15],"width":[80,60,45,40],"angle":[25,-30,30],"position":[0,40,40,20],"texture":[18,4,63],"doubleside":true,"bump":{"position":20,"size":5}},"mein2":{"offset":{"x":10,"y":-40,"z":-1},"length":[50,35],"width":[40,20,15],"angle":[25,-30],"position":[5,50,50],"texture":[63,63],"doubleside":true,"bump":{"position":0,"size":0}},"spine":{"length":[25,25],"width":[30,40,30],"angle":[90,90],"position":[0,0,20],"doubleside":true,"texture":[18,63],"offset":{"x":0,"y":90,"z":0},"bump":{"position":30,"size":12}},"winglets":{"offset":{"x":0,"y":95,"z":5},"length":[15,15,10],"width":[35,35,25,25],"angle":[0,-10,40],"position":[-10,-10,0,10],"texture":[3,4,63],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Warthog","level":7,"model":11,"code":711,"specs":{"shield":{"capacity":[270,270],"reload":[15,15]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":250,"speed":[40,40],"rotation":[60,60],"acceleration":[120,120]}},"shape":[3.298,3.22,2.447,1.879,1.886,1.869,2.296,2.503,2.728,2.702,3.031,2.992,2.922,2.914,2.881,2.758,2.853,2.623,1.895,1.073,1.184,1.391,3.556,3.626,3.253,3.675,3.253,3.626,3.556,1.391,1.184,1.073,1.895,2.623,2.853,2.758,2.881,2.914,2.922,2.992,3.031,2.702,2.728,2.503,2.296,1.869,1.886,1.879,2.447,3.22],"lasers":[{"x":0,"y":-3.293,"z":0.176,"angle":0,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":-0.024,"y":-3.233,"z":0,"angle":1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6},{"x":0.024,"y":-3.233,"z":0,"angle":-1.5,"damage":[8,8],"rate":0.23,"type":1,"speed":[160,160],"number":1,"spread":0,"error":6.5,"recoil":6}],"radius":3.675}}'
        },
        name: "Air-strike",
        cooldown: 40 * 60,
        duration: 1.75 * 60,
        cooldownRestartOnEnd: true,
        customInAbilityText: true,
        endOnDeath: true,

        requirementsText: function (ship) {
            return ship.custom.inAbility ? "SPAM FIRING!!" : HelperFunctions.templates.requirementsText.call(this, ship);
        },

        generatorInit: 0,

        tickInterval: 15,

        collectibleCode: 11, // missiles

        tick: function (ship) {
            ship.emptyWeapons();
            HelperFunctions.spawnCollectibles(ship, Array(2).fill(this.collectibleCode));
        },

        end: function (ship) {
            HelperFunctions.templates.end.call(this, ship);
            ship.emptyWeapons();
        }
    },
    "Ekho": {
        models: {
            default: '{"name":"Ekho","designer":"nex","level":6,"model":12,"size":1.34,"zoom":0.9,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[335,335],"reload":[50,50]},"ship":{"mass":260,"speed":[103,103],"rotation":[50,50],"acceleration":[150,150]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":17,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-65,-35,5,30,50,70,120,110],"z":[-10,-10,-10,-8,-5,-3,0,0,0,0]},"width":[0,10,17,25,31,23,20,27,30,0],"height":[0,5,8,12,14,15,10,18,14,0],"texture":[3,1,3,10,4,13,4,8,17],"propeller":true,"laser":{"damage":[300,300],"rate":10,"type":2,"speed":[1,1],"number":20,"error":0,"angle":0,"recoil":0}},"big_barrel_jars_cannel":{"section_segments":8,"offset":{"x":0,"y":2,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-120,-135,-120,-92,-75,-80,-50,30,20],"z":[0,0,0,0,0,0,0,19,18]},"width":[0,13,15,16,10,16,23,30,0],"height":[0,13,15,16,10,16,16,12,0],"texture":[6,4,8,4,4,13],"propeller":false,"angle":0,"laser":{"damage":[30,30],"rate":1,"type":1,"speed":[150,150],"number":10,"error":0,"angle":0,"recoil":0}},"prjopljurq8u590xgdfsvsorskt":{"section_segments":8,"offset":{"x":20,"y":32,"z":-15},"position":{"x":[0,0,0,0,0,5],"y":[-115,-95,-100,-85,-60,0],"z":[0,0,0,0,0,15]},"width":[0,8,13,16,20,0],"height":[0,8,13,16,20,0],"texture":[6,18,2,63,13],"propeller":true},"cockpit":{"section_segments":16,"offset":{"x":0,"y":-3,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-45,-36,-17,5,50,90,0],"z":[0,0,0,0,5,13,15]},"width":[0,6,10,15,12,5,0],"height":[0,8,14,16,11,7,0],"texture":[7,9,9,4,4,3],"propeller":false},"prjopljursorskt":{"section_segments":8,"offset":{"x":40,"y":122,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-115,-95,-100,-85,-60,-45,-30,0,15,40,30],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,13,16,20,12,23,25,25,20,0],"height":[0,8,13,16,20,12,23,25,25,20,0],"texture":[6,18,3,11,4,4,8,4,3,17]}},"wings":{"mein":{"offset":{"x":-1,"y":72,"z":0},"length":[53,30,40,40],"width":[90,70,60,40,20],"angle":[58,0,-20,0],"position":[0,40,40,60,40],"texture":[18,4,8,63],"doubleside":true,"bump":{"position":0,"size":10}},"clamper":{"offset":{"x":-1,"y":7,"z":0},"length":[70,30,50,40],"width":[90,70,60,40,20],"angle":[-18,0,-20,0],"position":[50,40,70,75,70],"texture":[11,63,8,4],"doubleside":true,"bump":{"position":0,"size":10}},"jaws":{"offset":{"x":6,"y":-68,"z":-18},"length":[35,-5,35],"width":[70,30,120,30],"angle":[0,15,35],"position":[34,25,0,60],"texture":[1,13,4],"doubleside":true,"bump":{"position":0,"size":15}},"bottom_jaws":{"offset":{"x":0,"y":-98,"z":-18},"length":[30,-5,30],"width":[70,30,130,30],"angle":[-40,-45,-45],"position":[11,25,0,60],"texture":[63,13,4],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Ekho","level":6,"model":12,"code":612,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[335,335],"reload":[50,50]},"ship":{"mass":260,"speed":[103,103],"rotation":[50,50],"acceleration":[150,150]}},"shape":[3.571,4.399,3.65,3.343,2.829,2.473,2.237,2.071,1.964,1.888,1.849,1.792,1.751,1.748,1.954,5.261,5.42,5.135,4.87,4.853,4.795,4.799,4.63,4.565,4.419,3.679,4.419,4.565,4.63,4.799,4.795,4.853,4.87,5.135,5.42,5.261,1.954,1.748,1.751,1.792,1.849,1.888,1.964,2.071,2.237,2.473,2.829,3.343,3.65,4.399],"lasers":[{"x":0,"y":-1.956,"z":0.268,"angle":0,"damage":[300,300],"rate":10,"type":2,"speed":[1,1],"number":20,"spread":0,"error":0,"recoil":0},{"x":0,"y":-3.564,"z":-0.402,"angle":0,"damage":[30,30],"rate":1,"type":1,"speed":[150,150],"number":10,"spread":0,"error":0,"recoil":0}],"radius":5.42}}',
            ability: '{"name":"Ekho","designer":"nex","level":7,"model":12,"size":1.22,"specs":{"shield":{"capacity":[335,335],"reload":[22,22]},"generator":{"capacity":[360,360],"reload":[120,120]},"ship":{"mass":250,"speed":[100,100],"rotation":[60,60],"acceleration":[140,140]}},"bodies":{"main":{"section_segments":0,"offset":{"x":0,"y":17,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-65,-35,5,30,50,70,120,110],"z":[-10,-10,-10,-8,-5,-3,0,0,0,0]},"width":[0,10,17,25,31,23,20,27,30,0],"height":[0,5,8,12,14,15,10,18,14,0],"texture":[3,1,3,10,4,13,4,8,17],"propeller":false,"laser":{"damage":[340,340],"rate":1,"type":2,"speed":[500,500],"number":999,"angle":360,"error":360}},"prjopljurq8u590xgdfsvsorskt":{"section_segments":0,"offset":{"x":20,"y":32,"z":-15},"position":{"x":[0,0,0,0,0,5],"y":[-115,-95,-100,-85,-60,0],"z":[0,0,0,0,0,15]},"width":[0,8,13,16,20,0],"height":[0,8,13,16,20,0],"texture":[6,18,2,63,13],"propeller":false},"big_barrel_jars_cannel":{"section_segments":0,"offset":{"x":0,"y":2,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-120,-135,-120,-92,-75,-80,-50,30,20],"z":[0,0,0,0,0,0,0,19,18]},"width":[0,13,15,16,10,16,23,30,0],"height":[0,13,15,16,10,16,16,12,0],"texture":[6,4,8,4,4,13],"propeller":false,"angle":0},"cockpit":{"section_segments":0,"offset":{"x":0,"y":-3,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-45,-36,-17,5,50,90,0],"z":[0,0,0,0,5,13,15]},"width":[0,8,14,15,12,5,0],"height":[0,8,14,16,11,7,0],"texture":[7,9,9,4,4,3],"propeller":false},"prjopljursorskt":{"section_segments":0,"offset":{"x":40,"y":122,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-115,-95,-100,-85,-60,-45,-30,0,15,40,30],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,13,16,20,12,23,25,25,20,0],"height":[0,8,13,16,20,12,23,25,25,20,0],"texture":[6,18,3,11,4,4,8,4,3,17],"propeller":false}},"typespec":{"name":"Ekho","level":7,"model":12,"code":712,"specs":{"shield":{"capacity":[335,335],"reload":[22,22]},"generator":{"capacity":[360,360],"reload":[120,120]},"ship":{"mass":250,"speed":[100,100],"rotation":[60,60],"acceleration":[140,140]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[{"x":0,"y":-1.781,"z":0.244,"angle":0,"damage":[340,340],"rate":1,"type":2,"speed":[500,500],"number":999,"spread":360,"error":360,"recoil":0}],"radius":18}}'
        },
        name: "Stealth",
        cooldown: 28 * 60,
        duration: 8.5 * 60,
        endOnDeath: true, /*in case of some wasp or smth damage killing it in ability */
        customEndcondition: true,
        canStartOnAbility: true,
        cooldownRestartOnEnd: true,
        customInAbilityText: true,

        endName: "Un-Stealth",

        canStart: function (ship) {
            return ship.custom.inAbility || HelperFunctions.templates.canStart.call(this, ship);
        },

        abilityName: function (ship) {
            return ship.custom.inAbility ? this.endName : this.name;
        },

        start: function (ship, lastStatus) {
            if (lastStatus) ship.custom.forceEnd = true;
            else {
                HelperFunctions.accelerate(ship, Math.sqrt(ship.vx ** 2 + ship.vy ** 2) + 0.1);
                ship.set({
                    type: this.codes.ability,
                    idle: true,
                    collider: false,
                    stats: AbilityManager.maxStats,
                    generator: 0
                });
            }
        },

        end: function (ship) {
            if (ship.custom.ability === this) ship.set({type: this.codes.default, stats: AbilityManager.maxStats, invulnerable: 100});
            ship.set({collider: true, idle: false});
        }
    },
    "Vampire": {
        models: {
            default: '{"name":"Vampire","designer":"nex","level":6,"model":13,"size":1.55,"specs":{"shield":{"capacity":[230,275],"reload":[6,9]},"generator":{"capacity":[192,192],"reload":[55,55]},"ship":{"mass":230,"speed":[120,125],"rotation":[90,90],"acceleration":[120,120]}},"bodies":{"main_DOESNOTSHOOT":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-35,-45,-15,10,30,45,70,100,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,15,25,15,15,25,20,0],"height":[0,6,13,17,13,13,17,13,0],"texture":[3,11,1,63,4,3,8,17],"propeller":true,"laser":{"damage":[100,100],"rate":1,"type":2,"speed":[1,1],"number":100,"error":20,"angle":0,"recoil":0}},"boris":{"section_segments":8,"offset":{"x":20,"y":30,"z":-5},"position":{"x":[0,0,-1,0,0,0,10,0,0],"y":[-105,-97,-80,-60,-20,0,20,50,40],"z":[-6.6,-10,-10,-10,0,0,0,0,0]},"width":[0,7,10,10,8,14,15,15,0],"height":[0,6,8,12,8,13,13,13,0],"texture":[6,4,1,10,8,4,13,17],"propeller":false,"angle":5,"laser":{"damage":[10,10],"rate":1,"type":2,"speed":[200,200],"number":10,"error":20,"angle":0,"recoil":15}},"propeller":{"section_segments":8,"offset":{"x":24,"y":25,"z":-5},"position":{"x":[0,0],"y":[41,40],"z":[0,0]},"width":[15,0],"height":[11,0],"texture":[69],"propeller":true,"angle":5},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-1,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-40,-25,-5,20,30,20],"z":[0,0,0,3,0,0]},"width":[0,9,12,17,10,0],"height":[0,8,12,14,13,0],"texture":[3,9,9,4],"propeller":false}},"wings":{"holy_moly_its_goku":{"offset":{"x":29,"y":44,"z":0},"length":[25,30],"width":[60,35,20],"angle":[-30,-20],"position":[0,10,25],"texture":[11,4],"doubleside":true,"bump":{"position":0,"size":10}},"what_no_way":{"offset":{"x":5,"y":45,"z":0},"length":[30,30],"width":[60,35,20],"angle":[30,20],"position":[0,15,35],"texture":[11,4],"doubleside":true,"bump":{"position":0,"size":10}},"teeth":{"offset":{"x":8,"y":-60,"z":-19},"length":[10,-10,25],"width":[15,15,55,25],"angle":[-30,-30,-20],"position":[10,3,-20,10],"texture":[4,13,63],"doubleside":true,"bump":{"position":10,"size":15}},"backteeth":{"offset":{"x":33,"y":60,"z":-10},"length":[30,-10,30],"width":[25,15,55,20],"angle":[-28,-20,-30],"position":[-20,-30,-40,-10],"texture":[4,13,63],"doubleside":true,"bump":{"position":10,"size":15}},"somanyteeth":{"offset":{"x":15,"y":10,"z":-5},"length":[10,-10,25],"width":[15,15,55,20],"angle":[30,30,50],"position":[-10,-20,-30,0],"texture":[4,13,63],"doubleside":true,"bump":{"position":10,"size":15}}},"typespec":{"name":"Vampire","level":6,"model":13,"code":613,"specs":{"shield":{"capacity":[230,275],"reload":[6,9]},"generator":{"capacity":[192,192],"reload":[55,55]},"ship":{"mass":230,"speed":[120,125],"rotation":[90,90],"acceleration":[120,120]}},"shape":[1.89,3.342,2.839,2.464,2.207,1.819,1.53,1.062,0.964,0.926,0.914,1.582,1.674,1.816,2.008,2.301,2.691,2.914,3.352,3.46,3.339,3.251,2.756,3.161,3.156,3.106,3.156,3.161,2.756,3.251,3.339,3.46,3.352,2.914,2.691,2.301,2.008,1.816,1.674,1.582,0.914,0.926,0.964,1.062,1.53,1.819,2.207,2.464,2.839,3.342],"lasers":[{"x":0,"y":-1.395,"z":0,"angle":0,"damage":[100,100],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":20,"recoil":0},{"x":0.336,"y":-2.313,"z":-0.155,"angle":5,"damage":[10,10],"rate":1,"type":2,"speed":[200,200],"number":10,"spread":0,"error":20,"recoil":15},{"x":-0.336,"y":-2.313,"z":-0.155,"angle":-5,"damage":[10,10],"rate":1,"type":2,"speed":[200,200],"number":10,"spread":0,"error":20,"recoil":15}],"radius":3.46}}',
            ability: '{"name":"Vampire","designer":"nex","level":7,"model":13,"size":1.65,"specs":{"shield":{"capacity":[300,300],"reload":[20,20]},"generator":{"capacity":[1000,1000],"reload":[500,500]},"ship":{"mass":250,"speed":[85,85],"rotation":[60,60],"acceleration":[100,100]}},"bodies":{"main_DOESNOTSHOOT":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-35,-45,-15,10,30,45,70,100,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,15,25,15,15,25,20,0],"height":[0,6,13,17,13,13,17,13,0],"texture":[3,11,1,63,4,3,8,17],"propeller":true},"boris":{"section_segments":8,"offset":{"x":20,"y":30,"z":-5},"position":{"x":[0,0,-1,0,0,0,10,0,0],"y":[-105,-97,-80,-60,-20,0,20,50,40],"z":[-6.6,-10,-10,-10,0,0,0,0,0]},"width":[0,7,10,10,8,14,15,15,0],"height":[0,6,8,12,8,13,13,13,0],"texture":[6,4,1,10,8,4,13,17],"propeller":false,"angle":5,"laser":{"damage":[10,10],"rate":1,"type":1,"speed":[100,100],"number":100,"error":0,"angle":45,"recoil":0}},"propeller":{"section_segments":8,"offset":{"x":24,"y":25,"z":-5},"position":{"x":[0,0],"y":[41,40],"z":[0,0]},"width":[15,0],"height":[11,0],"texture":[69],"propeller":true,"angle":5},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-1,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-40,-25,-5,20,30,20],"z":[0,0,0,3,0,0]},"width":[0,9,12,17,10,0],"height":[0,8,12,14,13,0],"texture":[3,5,5,4],"propeller":false}},"wings":{"holy_moly_its_goku":{"offset":{"x":29,"y":44,"z":0},"length":[25,30],"width":[60,35,20],"angle":[-30,-20],"position":[0,10,25],"texture":[11,4],"doubleside":true,"bump":{"position":0,"size":10}},"what_no_way":{"offset":{"x":5,"y":45,"z":0},"length":[30,30],"width":[60,35,20],"angle":[30,20],"position":[0,15,35],"texture":[11,4],"doubleside":true,"bump":{"position":0,"size":10}},"teeth":{"offset":{"x":8,"y":-60,"z":-19},"length":[10,-10,25],"width":[15,15,55,25],"angle":[-30,-30,-20],"position":[10,3,-20,10],"texture":[4,13,63],"doubleside":true,"bump":{"position":10,"size":15}},"backteeth":{"offset":{"x":33,"y":60,"z":-10},"length":[30,-10,30],"width":[25,15,55,20],"angle":[-28,-20,-30],"position":[-20,-30,-40,-10],"texture":[4,13,63],"doubleside":true,"bump":{"position":10,"size":15}},"somanyteeth":{"offset":{"x":15,"y":10,"z":-5},"length":[10,-10,25],"width":[15,15,55,20],"angle":[30,30,50],"position":[-10,-20,-30,0],"texture":[4,13,63],"doubleside":true,"bump":{"position":10,"size":15}}},"typespec":{"name":"Vampire","level":7,"model":13,"code":713,"specs":{"shield":{"capacity":[300,300],"reload":[20,20]},"generator":{"capacity":[1000,1000],"reload":[500,500]},"ship":{"mass":250,"speed":[85,85],"rotation":[60,60],"acceleration":[100,100]}},"shape":[2.012,3.557,3.022,2.623,2.349,1.936,1.629,1.131,1.026,0.986,0.973,1.684,1.782,1.934,2.137,2.449,2.864,3.102,3.568,3.683,3.554,3.461,2.934,3.365,3.359,3.306,3.359,3.365,2.934,3.461,3.554,3.683,3.568,3.102,2.864,2.449,2.137,1.934,1.782,1.684,0.973,0.986,1.026,1.131,1.629,1.936,2.349,2.623,3.022,3.557],"lasers":[{"x":0.358,"y":-2.462,"z":-0.165,"angle":5,"damage":[10,10],"rate":1,"type":1,"speed":[100,100],"number":100,"spread":45,"error":0,"recoil":0},{"x":-0.358,"y":-2.462,"z":-0.165,"angle":-5,"damage":[10,10],"rate":1,"type":1,"speed":[100,100],"number":100,"spread":45,"error":0,"recoil":0}],"radius":3.683}}'
        },
        name: "Gesshoku",
        namae: "月食",
        cooldown: 32 * 60,
        duration: 3 * 60,
        endOnDeath: true,
        cooldownRestartOnEnd: true,

        chance: 15,

        abilityName: function (ship) {
            let abilCustom = ship.custom.abilityCustom || {};

            if (abilCustom.__vampireAbilityName__ == null) abilCustom.__vampireAbilityName__ = HelperFunctions.randInt(this.chance) ? this.name : this.namae;

            ship.custom.abilityCustom = abilCustom;
            
            return abilCustom.__vampireAbilityName__;
        },

        end: function (ship) {
            HelperFunctions.templates.end.call(this, ship);
            ship.set({ generator: 0 });
        }
    },
    "Hellcat": {
        models: {
            default: '{"name":"Hellcat","level":6,"model":14,"size":2,"specs":{"shield":{"capacity":[300,300],"reload":[8,8]},"generator":{"capacity":[200,250],"reload":[60,65]},"ship":{"mass":360,"speed":[90,90],"rotation":[60,60],"acceleration":[110,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-70,-60,-40,0,50,90,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,18,25,25,15,0],"height":[1,5,10,15,25,20,10,0],"texture":[6,4,4,63,11,63,12],"propeller":true,"laser":{"damage":[5,6],"rate":6,"type":1,"speed":[300,300],"number":1,"error":1}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":35},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,10,15,25],"z":[0,0,0,0,0]},"width":[0,7,10,10,5],"height":[0,8,13,12,5],"texture":[9,9,4,4],"propeller":false},"arms":{"section_segments":8,"offset":{"x":50,"y":0,"z":-10},"position":{"x":[-5,-5,-5,0,8,0,-10,-10],"y":[-85,-70,-80,-30,5,35,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,6,7,18,18,15,10,0],"height":[1,5,6,20,30,25,10,0],"texture":[6,4,4,15,3,4,12],"angle":3,"propeller":true,"laser":{"damage":[10,10],"rate":4,"type":1,"speed":[200,200],"number":1,"error":0}},"thruster":{"section_segments":10,"offset":{"x":25,"y":15,"z":-10},"position":{"x":[-8,-3,0,0,0,0,0,0,5,5],"y":[-55,-35,0,10,20,25,30,40,70,60],"z":[20,10,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,10,10,10,10,10,10,5,0],"texture":[6,4,10,3,4,3,2],"propeller":true},"canon":{"section_segments":12,"offset":{"x":85,"y":27,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,5,7,7,3,5,0],"height":[0,5,15,15,3,5,0],"angle":3.5,"laser":{"damage":[10,10],"rate":4,"type":1,"speed":[190,190],"number":1,"error":0},"propeller":false,"texture":[6,4,10,4,4,4]}},"wings":{"main":{"offset":{"x":0,"y":-15,"z":20},"length":[60,35],"width":[60,30,20],"angle":[-25,10],"position":[30,55,25],"texture":[11,11],"bump":{"position":30,"size":10}},"ear":{"length":[30,30],"width":[60,40,20],"angle":[65,40],"position":[0,0,20],"doubleside":1,"texture":3,"offset":{"x":0,"y":-5,"z":4},"bump":{"position":30,"size":10}},"ear2":{"length":[25,25],"width":[50,30,10],"angle":[65,40],"position":[0,0,15],"doubleside":1,"texture":17,"offset":{"x":0,"y":-3,"z":9},"bump":{"position":30,"size":10}},"font":{"length":[55],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}},"font2":{"offset":{"x":0,"y":40,"z":8},"length":[50],"width":[20,15],"angle":[-11,20],"position":[20,40],"texture":[63],"bump":{"position":30,"size":10}},"back":{"length":[10,10],"width":[30,20,20],"angle":[45,45],"position":[0,10,20],"doubleside":true,"texture":63,"offset":{"x":50,"y":70,"z":-10},"bump":{"position":30,"size":15}},"back2":{"length":[15,10],"width":[30,20,20],"angle":[45,45],"position":[0,10,20],"doubleside":true,"texture":63,"offset":{"x":50,"y":45,"z":-10},"bump":{"position":30,"size":15}},"back3":{"length":[15,10],"width":[30,20,20],"angle":[45,45],"position":[0,10,20],"doubleside":true,"texture":63,"offset":{"x":55,"y":-40,"z":-10},"bump":{"position":30,"size":15}}},"typespec":{"name":"Hellcat","level":6,"model":14,"code":614,"specs":{"shield":{"capacity":[300,300],"reload":[8,8]},"generator":{"capacity":[200,250],"reload":[60,65]},"ship":{"mass":360,"speed":[90,90],"rotation":[60,60],"acceleration":[110,110]}},"shape":[2.806,2.807,2.338,3.739,3.773,3.651,3.352,3.159,3.086,3.145,3.45,3.565,3.593,3.671,3.789,3.902,4.102,4.377,4.405,4.041,4.752,4.565,4.433,3.575,3.65,3.607,3.65,3.575,4.433,4.565,4.752,4.041,4.405,4.377,4.102,3.902,3.789,3.671,3.593,3.565,3.45,3.145,3.086,3.159,3.352,3.651,3.773,3.739,2.338,2.807],"lasers":[{"x":0,"y":-2.8,"z":0.8,"angle":0,"damage":[5,6],"rate":6,"type":1,"speed":[300,300],"number":1,"spread":0,"error":1,"recoil":0},{"x":1.622,"y":-3.385,"z":-0.4,"angle":3,"damage":[10,10],"rate":4,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.622,"y":-3.385,"z":-0.4,"angle":-3,"damage":[10,10],"rate":4,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.278,"y":-0.916,"z":0,"angle":3.5,"damage":[10,10],"rate":4,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.278,"y":-0.916,"z":0,"angle":-3.5,"damage":[10,10],"rate":4,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.752}}',
            ability: '{"name":"Attack Pod","level":7,"model":14,"size":1.2,"zoom":0.6,"specs":{"shield":{"capacity":[350,350],"reload":[14,14]},"generator":{"capacity":[200,200],"reload":[45,45]},"ship":{"mass":360,"speed":[108,108],"rotation":[68,68],"acceleration":[115,115]}},"bodies":{"main":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,0,25,50,40],"z":[0,0,0,0,0,0,0]},"width":[0,10,50,50,20,0],"height":[0,5,20,15,15,0],"propeller":false,"texture":[1,1,4,3,17]},"cannon":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-30,0,30,35,40],"z":[0,0,0,5,5,0,0,0,0]},"width":[0,10,15,10,15,10,0],"height":[0,10,15,18,15,10,0],"propeller":false,"texture":[4,63,1,1,1,4],"laser":{"damage":[20,20],"rate":4,"type":1,"speed":[180,180],"number":1,"error":0}}},"wings":{"I000l":{"length":[60],"width":[80,30],"angle":[0,0],"position":[0,20],"doubleside":true,"texture":[63],"offset":{"x":0,"y":0,"z":-5},"bump":{"position":30,"size":20}}},"typespec":{"name":"Attack Pod","level":7,"model":14,"code":714,"specs":{"shield":{"capacity":[350,350],"reload":[14,14]},"generator":{"capacity":[200,200],"reload":[45,45]},"ship":{"mass":360,"speed":[108,108],"rotation":[68,68],"acceleration":[115,115]}},"shape":[1.683,1.697,1.447,1.05,0.959,0.9,0.859,0.833,0.841,0.899,0.982,1.103,1.267,1.451,1.485,1.547,1.642,1.667,1.462,1.286,1.161,1.195,1.263,1.262,1.221,1.202,1.221,1.262,1.263,1.195,1.161,1.286,1.462,1.667,1.642,1.547,1.485,1.451,1.267,1.103,0.982,0.899,0.841,0.833,0.859,0.9,0.959,1.05,1.447,1.697],"lasers":[{"x":0,"y":-1.68,"z":0,"angle":0,"damage":[20,20],"rate":4,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":1.697}}'
        },
        name: "Drones",
        cooldown: 30 * 60,
        duration: 15 * 60,
        endOnDeath: true,
        cooldownRestartOnEnd: true,
        customInAbilityText: true,

        attackPodCode: 41,

        range: 30,
        showAbilityRangeUI: true,

        requirementsText: function (ship) {
            return ship.custom.inAbility ? HelperFunctions.timeLeft(ship.custom.lastTriggered + this.duration) : HelperFunctions.templates.requirementsText.call(this, ship);
        },

        start: function (ship) {
            HelperFunctions.templates.start.call(this, ship);
            ship.set({ generator: this.energy_capacities.ability, invulnerable: 180 });
            ship.emptyWeapons();
            HelperFunctions.spawnCollectibles(ship, Array(6).fill(this.attackPodCode));
            let targets = HelperFunctions.findEntitiesInRange(ship, this.range, true, false, { ships: true }, true);
            for (let target of targets) HelperFunctions.spawnCollectibles(target, Array(3).fill(this.attackPodCode));
        },

        end: function (ship) {
            HelperFunctions.templates.end.call(this, ship);
            ship.emptyWeapons();
        }
    },
    "Intervention": {
        models: {
            default: '{"name":"Intervention","level":6,"model":15,"size":2.55,"specs":{"shield":{"capacity":[360,360],"reload":[6,8]},"generator":{"capacity":[150,180],"reload":[45,50]},"ship":{"mass":420,"speed":[60,65],"rotation":[52,56],"acceleration":[115,125]}},"bodies":{"main":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,0,25,50,40],"z":[0,0,0,0,0,0,0]},"width":[0,10,40,40,20,0],"height":[0,5,20,15,15,0],"propeller":1,"texture":[1,1,4,3,17]},"cannon":{"section_segments":12,"offset":{"x":0,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-145,-145,-150,-140,-130,-100,-90,-90,-50,0,30,35,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,20,15,15,20,25,20,20,25,25,0],"height":[0,10,15,20,15,15,20,25,25,25,20,20,0],"propeller":false,"texture":[17,4,63,3,8,3,3,4,2],"laser":{"damage":[60,60],"rate":1,"type":2,"speed":[250,300],"number":2,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-25,"z":24},"position":{"x":[0,0,0,0,0,0],"y":[-15,-15,10,40,70,70],"z":[-1,-1,-1,0,0,0]},"width":[0,7,12,12,8,0],"height":[0,4,6,5,3,0],"propeller":false,"texture":[7,9,8.2,4],"laser":{"damage":[120,120],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"recoil":0}},"detail11":{"section_segments":6,"offset":{"x":0,"y":-25,"z":20},"position":{"x":[0,0,0,0,0,0],"y":[-18,-18,10,40,70,70],"z":[-1,-1,-1,0,0,0]},"width":[0,10,15,15,10,0],"height":[0,4,8,5,5,0],"propeller":false,"texture":[4]},"shield":{"section_segments":12,"offset":{"x":30,"y":-55,"z":0},"position":{"x":[0,0,0,-10,-10],"y":[-30,-30,0,20,20],"z":[0,0,0,0,0]},"width":[0,8,8,5,0],"height":[0,30,25,10,0],"texture":4,"angle":90},"sideconnector":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-20,"y":25,"z":0},"position":{"x":[0,0,0,0,0],"y":[-70,-70,-65,0,0],"z":[0,0,0,0,0]},"width":[0,4,7,20,0],"height":[0,6,10,16,0],"texture":[4,63,11]},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":13,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"width":[0,10,10,6,4,0],"height":[0,25,25,20,24,0],"texture":[15,15,4,4,17],"vertical":true,"angle":40},"siderails":{"section_segments":8,"angle":175,"offset":{"x":25,"y":-5,"z":0},"position":{"x":[0,0,0,0],"y":[-5,-5,45,45],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"texture":[2]},"sidedetail":{"section_segments":8,"angle":95,"offset":{"x":35,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,5,5,5,5],"z":[0,0,0,0,0,0]},"width":[0,25,20,15,10,0],"height":[0,10,10,10,5,0],"texture":[2,63,63,17,5]},"legs":{"section_segments":6,"angle":-144,"offset":{"x":10,"y":35,"z":0},"position":{"x":[15,15,5,0,0,0],"y":[-60,-60,-50,-40,0,0],"z":[-20,-20,-20,-5,0,0]},"width":[0,5,9,10,20,0],"height":[0,4,6,6,9,0],"texture":[3.9,63,12.9,3.9]},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":8,"y":0,"z":90},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[25,25,20,20,25],"texture":[63]}},"wings":{"I000l":{"length":[46],"width":[30,15],"angle":[10,0],"position":[0,50],"doubleside":true,"texture":[63],"offset":{"x":-5,"y":-70,"z":-5},"bump":{"position":30,"size":20}}},"typespec":{"name":"Intervention","level":6,"model":15,"code":615,"specs":{"shield":{"capacity":[360,360],"reload":[6,8]},"generator":{"capacity":[150,180],"reload":[45,50]},"ship":{"mass":420,"speed":[60,65],"rotation":[52,56],"acceleration":[115,125]}},"shape":[6.387,6.421,5.629,3.552,3.559,3.55,3.606,3.498,2.488,2.344,2.21,1.729,1.756,1.966,2.038,2.15,2.312,2.547,2.884,3.111,3.873,4.657,5.051,5.07,3.894,3.832,3.894,5.07,5.051,4.657,3.873,3.111,2.884,2.547,2.312,2.15,2.038,1.966,1.756,1.729,2.21,2.344,2.488,3.498,3.606,3.55,3.559,3.552,5.629,6.421],"lasers":[{"x":0,"y":-6.375,"z":0,"angle":0,"damage":[60,60],"rate":1,"type":2,"speed":[250,300],"number":2,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.04,"z":1.224,"angle":0,"damage":[120,120],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":6.421}}',
            ability: '{"name":"Intervention","level":7,"model":15,"size":2.65,"zoom":0.7,"specs":{"shield":{"capacity":[300,300],"reload":[1,1]},"generator":{"capacity":[500,500],"reload":[150,150]},"ship":{"mass":2000,"speed":[3,3],"rotation":[15,15],"acceleration":[200,200]}},"bodies":{"main":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":100,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,0,25,50,40],"z":[0,0,0,0,0,0,0]},"width":[0,10,40,40,20,0],"height":[0,5,20,15,15,0],"propeller":0,"texture":[1,1,4,3,17],"laser":{"damage":[500,500],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0}},"cannon":{"section_segments":12,"offset":{"x":0,"y":100,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-100,-300,-300,-175,-150,-140,-130,-100,-90,-90,-50,0,30,35,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,10,10,15,20,15,15,20,25,20,20,25,25,0],"height":[0,5,5,10,10,15,20,15,15,20,25,25,25,20,20,0],"propeller":false,"texture":[17,6,2,15,8,63,3,8,3,3,4,2],"laser":{"damage":[50,50],"rate":0.9,"type":1,"speed":[450,450],"number":10,"error":0}},"cannonringconnector":{"section_segments":12,"offset":{"x":0,"y":100,"z":0},"position":{"x":[0,0],"y":[-285,-200],"z":[0,0]},"width":[4,4],"height":[11,11],"propeller":false,"texture":[63,63]},"cannonringconnector2":{"section_segments":12,"offset":{"x":0,"y":100,"z":0},"position":{"x":[0,0],"y":[-285,-200],"z":[0,0]},"width":[11,11],"height":[4,4],"propeller":false,"texture":[63,63]},"brake":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":-240,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[35,35,10,10,25,40,40],"z":[0,0,0,0,0,0,0,0]},"width":[5,12,12,22,22,12,10],"height":[5,7,7,12,12,12,10],"propeller":false,"texture":[6,6,1,4,3,17]},"shield":{"section_segments":12,"offset":{"x":30,"y":20,"z":0},"position":{"x":[0,0,0,-10,-10],"y":[-30,-30,0,20,20],"z":[0,0,0,0,0]},"width":[0,8,8,5,0],"height":[0,30,25,10,0],"texture":4,"angle":90},"sideconnector":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-20,"y":100,"z":0},"position":{"x":[0,0,0,0,0],"y":[-70,-70,-65,0,0],"z":[0,0,0,0,0]},"width":[0,4,7,20,0],"height":[0,6,10,16,0],"texture":[4,63,11]},"scope":{"section_segments":8,"offset":{"x":0,"y":75,"z":40},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-50,-50,-20,10,35,35,35],"z":[0,0,0,0,0,0,0,0]},"width":[0,8,12,8,8,10,6,0],"height":[0,8,12,8,8,10,6,0],"texture":[7,4,3,10,3,3,7],"angle":0},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":13,"z":-75},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"width":[0,10,10,6,4,0],"height":[0,25,25,20,24,0],"texture":[15,15,4,4,17],"vertical":true,"angle":40},"scopeholder":{"section_segments":6,"angle":0,"offset":{"x":0,"y":53,"z":40},"position":{"x":[0,0,0,0],"y":[-5,-5,5,5],"z":[0,0,0,0]},"width":[0,11,11,0],"height":[0,11,11,0],"texture":[3.9]},"scopeholder1":{"section_segments":6,"angle":0,"offset":{"x":0,"y":85,"z":40},"position":{"x":[0,0,0,0],"y":[-5,-5,5,5],"z":[0,0,0,0]},"width":[0,11,11,0],"height":[0,11,11,0],"texture":[3.9]},"scopeholder2":{"vertical":true,"section_segments":6,"angle":0,"offset":{"x":0,"y":25,"z":-53.7},"position":{"x":[0,0,0,0],"y":[-8,-8,8,8],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"texture":[3.9]},"scopeholder3":{"vertical":true,"section_segments":6,"angle":0,"offset":{"x":0,"y":25,"z":-85},"position":{"x":[0,0,0,0],"y":[-8,-8,8,8],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"texture":[3.9]},"siderails":{"section_segments":8,"angle":175,"offset":{"x":25,"y":70,"z":0},"position":{"x":[0,0,0,0],"y":[-5,-5,45,45],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"texture":[2]},"sidedetail":{"section_segments":8,"angle":95,"offset":{"x":35,"y":100,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,5,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,25,20,15,10,0],"height":[0,10,10,10,5,0],"texture":[2,63,63,17,5]},"legs":{"section_segments":6,"angle":-144,"offset":{"x":10,"y":110,"z":0},"position":{"x":[-5,5,10,0,0,0],"y":[-110,-110,-90,-50,0,0],"z":[-20,-20,-20,-5,0,0]},"width":[0,5,9,10,20,0],"height":[0,4,6,6,9,0],"texture":[3.9,63,12.9,3.9]},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":8,"y":0,"z":15},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[25,25,20,20,25],"texture":[63]},"barrelrings2":{"section_segments":8,"offset":{"x":0,"y":-100,"z":0},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[12,12,7,7,12],"height":[12,12,7,7,12],"texture":[63]},"barrelrings3":{"section_segments":8,"offset":{"x":0,"y":-180,"z":0},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[12,12,7,7,12],"height":[12,12,7,7,12],"texture":[63]}},"wings":{"I000l":{"length":[46],"width":[30,15],"angle":[10,0],"position":[0,50],"doubleside":true,"texture":[63],"offset":{"x":-5,"y":5,"z":-5},"bump":{"position":30,"size":20}}},"typespec":{"name":"Intervention","level":7,"model":15,"code":715,"specs":{"shield":{"capacity":[300,300],"reload":[1,1]},"generator":{"capacity":[500,500],"reload":[150,150]},"ship":{"mass":2000,"speed":[3,3],"rotation":[15,15],"acceleration":[200,200]}},"shape":[12.214,12.227,3.441,2.698,2.414,2.092,1.957,1.825,1.74,1.685,1.508,1.374,1.283,1.22,1.168,1.066,3.024,3.235,3.041,3.35,3.941,5.547,11.406,11.362,8.199,7.966,8.199,11.362,11.406,5.547,3.941,3.35,3.041,3.235,3.024,1.066,1.168,1.22,1.283,1.374,1.508,1.685,1.74,1.825,1.957,2.092,2.414,2.698,3.441,12.227],"lasers":[{"x":0,"y":5.3,"z":0,"angle":0,"damage":[500,500],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0},{"x":0,"y":-10.6,"z":0,"angle":0,"damage":[50,50],"rate":0.9,"type":1,"speed":[450,450],"number":10,"spread":0,"error":0,"recoil":0}],"radius":12.227}}'
        },
        name: "Deploy",
        cooldown: 32 * 60,
        duration: 10 * 60,
        endOnDeath: true,
        cooldownRestartOnEnd: true,

        start: function (ship) {
            ship.set({type: this.codes.ability, stats: AbilityManager.maxStats, vx: 0, vy: 0});
        }
    },
    "Vulcan": {
        models: {
            default: '{"name":"Vulcan","designer":"nex","level":7,"model":16,"size":1.65,"zoom":1,"specs":{"shield":{"capacity":[250,250],"reload":[6,6]},"generator":{"capacity":[320,320],"reload":[45,45]},"ship":{"mass":240,"speed":[95,95],"rotation":[53,53],"acceleration":[100,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-92.5,-70,-45,-20,10,35,55,75,100,90],"z":[-10,-10,-10,-9,-8,-6,-4,-2,0,0,0]},"width":[0,10,13,15,18,23,25,20,20,18,0],"height":[0,6,8,10,13,16,18,15,15,13,0],"texture":[3,2,10,1,2,3,3,4,4],"propeller":false},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":3},"position":{"x":[0,0,0,0,0],"y":[-58,-50,-30,0,60],"z":[0,0,0,4,15]},"width":[0,7,12,15,7],"height":[0,9,16,16,7],"texture":[7,9,9,4],"propeller":false,"laser":{"damage":[300,300],"rate":1,"type":2,"speed":[300,300],"number":360,"error":360,"angle":360,"recoil":360}},"feets":{"section_segments":12,"offset":{"x":15,"y":55,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-60,-55,-35,-15,0,15,40,65,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,20,23,17,25,25,15,0],"height":[0,12,20,23,17,25,25,23,0],"texture":[4,3,10,4,4,8,12,17],"propeller":1},"foots":{"section_segments":12,"offset":{"x":5,"y":25,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-60,-55,-35,-15,0,15,40,65,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,20,23,17,25,25,15,0],"height":[0,12,20,23,17,25,25,23,0],"texture":[4,3,10,4,4,8,12,17],"propeller":1},"fists":{"section_segments":8,"offset":{"x":8,"y":-57.5,"z":-15},"position":{"x":[0,0,0,0,0,5,-7,15,15],"y":[-50,-45,-30,-10,0,10,58,100,90],"z":[0,0,0,0,0,0,4,9,10]},"width":[0,12,18,20,10,20,20,15,0],"height":[0,10,14,16,10,16,16,14,0],"texture":[2,1,2,4,3,11,18],"propeller":false},"deco":{"section_segments":8,"offset":{"x":55,"y":-50,"z":-15},"position":{"x":[-14,-13,-5,-5,-5],"y":[-40,-15,0,20,30],"z":[0,0,0,0,0]},"width":[0,5,9,5,0],"height":[0,10,15,10,0],"texture":[3,4,63,2],"propeller":false,"laser":{"damage":[10,10],"rate":1.5,"type":1,"speed":[150,150],"number":1,"error":0,"angle":0,"recoil":0}},"giant_cannon":{"section_segments":12,"offset":{"x":0,"y":5,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-50,-170,-100,-20,0,20,35,30,50,70,100,90],"z":[0,0,0,0,0,0,0,0,0,-3,-10,-20,-20]},"width":[0,5,8,9,15,12,12,20,20,30,25,20,0],"height":[0,5,8,9,12,12,12,16,20,25,25,25,0],"texture":[17,13,13,4,63,10,63,4,2,4,8,13],"propeller":false,"angle":0,"laser":{"damage":[75,75],"rate":1,"type":1,"speed":[200,200],"number":4,"error":0,"angle":0,"recoil":100}}},"wings":{"frfont":{"offset":{"x":0,"y":-80,"z":-20},"length":[15,20,25],"width":[80,70,40,20],"angle":[0,10,0],"position":[0,-10,30,25],"texture":[4,8,1],"doubleside":true,"bump":{"position":0,"size":15}},"shields":{"offset":{"x":0,"y":70,"z":-3},"length":[45,40,45],"width":[50,90,70,30],"angle":[-40,60,120],"position":[-30,-30,40,-6],"texture":[18,63,11],"doubleside":true,"bump":{"position":-20,"size":15}},"shields2":{"offset":{"x":0,"y":120,"z":5},"length":[60,30,30],"width":[40,80,70,30],"angle":[-35,60,-30],"position":[-30,-70,-40,-5],"texture":[15,4,63],"doubleside":true,"bump":{"position":0,"size":15}},"winglets":{"offset":{"x":-2,"y":65,"z":0},"length":[70],"width":[80,20],"angle":[50],"position":[0,40],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Vulcan","level":7,"model":16,"code":716,"specs":{"shield":{"capacity":[250,250],"reload":[6,6]},"generator":{"capacity":[320,320],"reload":[45,45]},"ship":{"mass":240,"speed":[95,95],"rotation":[53,53],"acceleration":[100,100]}},"shape":[5.451,4.414,3.646,3.264,3.21,2.825,2.912,2.701,2.337,2.072,0.887,1.155,1.207,1.286,1.714,1.913,2.204,2.656,3.475,4.66,5.22,4.804,5.112,4.082,4.031,3.968,4.031,4.082,5.112,4.804,5.22,4.66,3.475,2.656,2.204,1.913,1.714,1.286,1.207,1.155,0.887,2.072,2.337,2.701,2.912,2.825,3.21,3.264,3.646,4.414],"lasers":[{"x":0,"y":-2.574,"z":0.099,"angle":0,"damage":[300,300],"rate":1,"type":2,"speed":[300,300],"number":360,"spread":360,"error":360,"recoil":360},{"x":1.353,"y":-2.97,"z":-0.495,"angle":0,"damage":[10,10],"rate":1.5,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.353,"y":-2.97,"z":-0.495,"angle":0,"damage":[10,10],"rate":1.5,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-5.445,"z":0.825,"angle":0,"damage":[75,75],"rate":1,"type":1,"speed":[200,200],"number":4,"spread":0,"error":0,"recoil":100}],"radius":5.451}}',
            ability: '{"name":"Vulcan","designer":"nex","level":6,"model":16,"size":1.65,"zoom":0.75,"specs":{"shield":{"capacity":[350,350],"reload":[7,7]},"generator":{"capacity":[450,450],"reload":[90,90]},"ship":{"mass":300,"speed":[80,80],"rotation":[50,50],"acceleration":[115,115]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-92.5,-70,-45,-20,10,35,55,75,100,90],"z":[-10,-10,-10,-9,-8,-6,-4,-2,0,0,0]},"width":[0,10,13,15,18,23,25,20,20,18,0],"height":[0,6,8,10,13,16,18,15,15,13,0],"texture":[3,2,10,1,2,3,3,4,4],"propeller":false},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":3},"position":{"x":[0,0,0,0,0],"y":[-58,-50,-30,0,60],"z":[0,0,0,4,15]},"width":[0,7,12,15,7],"height":[0,9,16,16,7],"texture":[7,9,9,4],"propeller":false},"feets":{"section_segments":12,"offset":{"x":30,"y":75,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-60,-55,-35,-15,0,15,40,65,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,20,23,17,25,25,15,0],"height":[0,12,20,23,17,25,25,23,0],"texture":[4,3,10,4,4,8,12,17],"propeller":1},"foots":{"section_segments":12,"offset":{"x":60,"y":65,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-60,-55,-35,-15,0,15,40,65,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,20,23,17,25,25,15,0],"height":[0,12,20,23,17,25,25,23,0],"texture":[4,3,10,4,4,8,12,17],"propeller":1},"fists":{"section_segments":8,"offset":{"x":15,"y":-77.5,"z":-15},"position":{"x":[0,0,0,0,0,5,-7,15,15],"y":[-50,-45,-30,-10,0,10,58,100,90],"z":[0,0,0,0,0,0,4,9,10]},"width":[0,12,18,20,10,20,20,15,0],"height":[0,10,14,16,10,16,16,14,0],"texture":[2,1,2,4,3,11,18],"propeller":false},"deco":{"section_segments":8,"offset":{"x":65,"y":-77.5,"z":-15},"position":{"x":[-14,-13,-5,2,10],"y":[-40,-15,0,20,30],"z":[0,0,0,0,0]},"width":[0,5,9,5,0],"height":[0,10,15,10,0],"texture":[3,4,63,2],"propeller":false},"giant_cannon_INDICATOR_DOESNOTSHOOT":{"section_segments":12,"offset":{"x":0,"y":5,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-170,-100,-20,0,20,35,30,50,70,100,90],"z":[60,115,80,40,30,20,13,15,-3,-10,-20,-20]},"width":[0,8,9,15,12,12,20,20,30,25,20,0],"height":[0,8,9,12,12,12,16,20,25,25,25,0],"texture":[13,13,4,63,10,63,4,2,4,8,13],"propeller":false,"angle":0,"laser":{"damage":[450,450],"rate":10,"type":2,"speed":[1000,1000],"number":30,"error":360,"angle":360,"recoil":360}},"NOHITBOX_airstrike_side":{"section_segments":12,"offset":{"x":400,"y":-1513,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":90,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_front":{"section_segments":12,"offset":{"x":0,"y":-1913,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":180,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_frontdouble":{"section_segments":12,"offset":{"x":300.0750187546887,"y":-1813.0750187546887,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":135,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_back":{"section_segments":12,"offset":{"x":0,"y":-1113,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":0,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_backdouble":{"section_segments":12,"offset":{"x":300.0750187546887,"y":-1212.9249812453113,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":45,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_backdoubledouble":{"section_segments":12,"offset":{"x":173.91304347826087,"y":-1132.047619047619,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":22.5,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_middledoubledouble":{"section_segments":12,"offset":{"x":380.95238095238096,"y":-1335.2222222222222,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":67.5,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_frontdoubledouble":{"section_segments":12,"offset":{"x":173.91304347826087,"y":-1893.952380952381,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":155,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"NOHITBOX_airstrike_frontmiddledoubledouble":{"section_segments":12,"offset":{"x":380.95238095238096,"y":-1690.7777777777778,"z":5},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":112.5,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"CURSOR_TOP":{"section_segments":12,"offset":{"x":5,"y":-1508,"z":50},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,5],"height":[0,0],"texture":[17],"propeller":false,"angle":45,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}},"CURSOR_BOTTOM":{"section_segments":12,"offset":{"x":5,"y":-1518,"z":50},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,5],"height":[0,0],"texture":[17],"propeller":false,"angle":135,"laser":{"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"error":0,"angle":0,"recoil":0}}},"wings":{"frfont":{"offset":{"x":10,"y":-80,"z":-20},"length":[35,25],"width":[70,40,20],"angle":[10,0],"position":[0,20,-15],"texture":[8,1],"doubleside":true,"bump":{"position":0,"size":15}},"shields":{"offset":{"x":20,"y":50,"z":-3},"length":[60,35,50],"width":[50,90,70,30],"angle":[-40,60,140],"position":[-30,-30,40,-6],"texture":[18,63,11],"doubleside":true,"bump":{"position":-20,"size":15}},"shields2":{"offset":{"x":10,"y":60,"z":5},"length":[70,56,40],"width":[40,80,70,30],"angle":[-55,30,-30],"position":[-30,-60,50,90],"texture":[15,4,63],"doubleside":true,"bump":{"position":0,"size":15}},"winglets":{"offset":{"x":-2,"y":65,"z":0},"length":[70],"width":[80,20],"angle":[50],"position":[0,40],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Vulcan","level":6,"model":16,"code":616,"specs":{"shield":{"capacity":[350,350],"reload":[7,7]},"generator":{"capacity":[450,450],"reload":[90,90]},"ship":{"mass":300,"speed":[80,80],"rotation":[50,50],"acceleration":[115,115]}},"shape":[50.68,4.414,4.162,4.227,4.06,4.155,3.506,3.198,2.989,2.048,2.353,2.42,2.532,2.622,2.751,2.934,3.27,3.912,5.468,6.9,7,4.953,4.832,4.853,4.703,4.017,4.703,4.853,4.832,4.953,7,6.9,5.468,3.912,3.27,2.934,2.751,2.622,2.532,2.42,2.353,2.048,2.989,3.198,3.506,4.155,4.06,4.227,4.162,4.414],"lasers":[{"x":0,"y":-5.445,"z":0.165,"angle":0,"damage":[450,450],"rate":10,"type":2,"speed":[1000,1000],"number":30,"spread":360,"error":360,"recoil":360},{"x":13.2,"y":-49.929,"z":0.165,"angle":90,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-13.2,"y":-49.929,"z":0.165,"angle":-90,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-63.129,"z":0.165,"angle":180,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":9.902,"y":-59.831,"z":0.165,"angle":135,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-9.902,"y":-59.831,"z":0.165,"angle":-135,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-36.729,"z":0.165,"angle":0,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":9.902,"y":-40.027,"z":0.165,"angle":45,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-9.902,"y":-40.027,"z":0.165,"angle":-45,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":5.739,"y":-37.358,"z":0.165,"angle":22.5,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-5.739,"y":-37.358,"z":0.165,"angle":-22.5,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":12.571,"y":-44.062,"z":0.165,"angle":67.5,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-12.571,"y":-44.062,"z":0.165,"angle":-67.5,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":5.739,"y":-62.5,"z":0.165,"angle":155,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-5.739,"y":-62.5,"z":0.165,"angle":-155,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":12.571,"y":-55.796,"z":0.165,"angle":112.5,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-12.571,"y":-55.796,"z":0.165,"angle":-112.5,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.165,"y":-49.764,"z":1.65,"angle":45,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.165,"y":-49.764,"z":1.65,"angle":-45,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.165,"y":-50.094,"z":1.65,"angle":135,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.165,"y":-50.094,"z":1.65,"angle":-135,"damage":[28.125,28.125],"rate":0.2,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0}],"radius":50.68}}'
        },
        name: "Higher",
        cooldown: 15 * 60,

        customEndcondition: true,

        higherModelRadius: 7,

        endName: "Lower",
        higherCooldown: 15 * 60,

        getCooldown: function (ship) {
            return ship.custom.abilityCustom.isHigher ? this.higherCooldown : this.cooldown;
        },

        getDefaultShipCode: function (ship) {
            return this.codes[ship.custom.abilityCustom.isHigher ? "ability" : "default"];
        },

        canStart: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.getCooldown(ship));
        },

        abilityName: function (ship) {
            return ship.custom.abilityCustom.isHigher ? this.endName : this.name;
        },

        requirementsText: function (ship) {
            return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.getCooldown(ship));
        },

        start: function (ship) {
            let isHigher = ship.custom.abilityCustom.isHigher = !ship.custom.abilityCustom.isHigher;
            let model = isHigher ? "ability" : "default";
            ship.set({
                type: this.codes[model],
                stats: AbilityManager.maxStats,
                generator: this.energy_capacities[model] * (isHigher ? 1/4 : 1)
            });
            ship.custom.forceEnd = true;
        },

        end: function () {},

        reload: function (ship) {
            ship.custom.lastTriggered = game.step - this.getCooldown(ship);
        },

        compile: function () {
            let higherModel = JSON.parse(this.models.ability);
            higherModel.typespec.radius = this.higherModelRadius;
            this.models.ability = JSON.stringify(higherModel);
        }
    },
    "Phoenix": {
        models: {
            default: '{"name":"Phoenix","designer":"Nex","level":6,"model":17,"size":1.9,"zoom":0.9,"specs":{"shield":{"capacity":[300,300],"reload":[8,10]},"generator":{"capacity":[300,300],"reload":[70,70]},"ship":{"mass":255,"speed":[117,117],"rotation":[64,64],"acceleration":[135,135]}},"bodies":{"main":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":30,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,0,25,50,40],"z":[-10,-10,0,0,0,0,0]},"width":[0,10,40,40,15,0],"height":[0,5,20,15,15,0],"propeller":1,"texture":[1,1,4,3,17]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-95,-85,-65,-65,-55,-40,-10,-10,5,5,20,20,30,30,80,85],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2]},"width":[0,5,12,15,20,20,10,10,15,15,10,10,15,15,13,10,0],"height":[0,5,12,15,20,20,10,10,15,15,10,10,12,13,10,10,0],"propeller":false,"texture":[17,5,17,4,8,63,3,4,63,4,3,1,4,3,3],"laser":{"damage":[9,9],"rate":10,"type":1,"speed":[50,50],"number":1,"error":25}},"cannon2":{"section_segments":6,"offset":{"x":0,"y":-55,"z":0},"position":{"x":[0,0],"y":[-40,-50],"z":[0,0]},"width":[0,4],"height":[0,4],"angle":0,"laser":{"damage":[6,6],"rate":8,"type":1,"speed":[25,25],"number":1,"error":60},"propeller":false,"texture":[3,3,10,3]},"cannon3":{"section_segments":6,"offset":{"x":0,"y":-55,"z":0},"position":{"x":[0,0],"y":[-40,-50],"z":[0,0]},"width":[0,4],"height":[0,4],"angle":0,"laser":{"damage":[4,4],"rate":10,"type":1,"speed":[60,60],"number":2,"error":10},"propeller":false,"texture":[3,3,10,3]},"detail6":{"section_segments":[35,65,105,145,215,325],"offset":{"x":0,"y":20,"z":0},"position":{"x":[-20,-20,-20,-20,-20],"y":[-70,-70,-65,0,0],"z":[0,0,0,0,0]},"width":[0,4,7,20,0],"height":[0,6,10,16,0],"texture":[4,63,11],"angle":10},"ignite":{"section_segments":6,"offset":{"x":0,"y":-40,"z":0},"position":{"x":[10,25,30,30,25,5,5],"y":[-80,-60,-30,40,50,70,80],"z":[0,0,0,0,5,5,5]},"width":[0,3,3,3,3,3,0],"height":[0,3,3,3,3,3,0],"texture":[16.9,6,4,2,4,4]},"barrel":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-50},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barrel2":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-30},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barrel3":{"section_segments":8,"vertical":0,"offset":{"x":0,"y":50,"z":-20},"position":{"x":[-30,-30,-30,-30,-30,-30],"y":[-15,-15,-10,30,35,35],"z":[10,10,10,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":-30,"texture":[4,4,63,4]},"detail24":{"section_segments":8,"angle":30,"offset":{"x":0,"y":18,"z":-40},"position":{"x":[30,30,30,30,30,30],"y":[-5,-5,3,3,3,3],"z":[0,0,0,0,0,0]},"width":[0,17,17,15,10,0],"height":[0,27,27,25,23,0],"texture":[4,3,2,4,3],"vertical":1},"cockpit":{"section_segments":6,"offset":{"x":0,"y":40,"z":12},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-51,-50,-40,-28,-13,27,27],"z":[-5,-5,0,0,0,0,0]},"width":[0,5,8,10,15,10,0],"height":[0,5,4,6,8,5,0],"propeller":false,"texture":[6.9,9,9,9,8,3.9]},"reactor":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":-3},"position":{"x":[16,16,16,16,16,16],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"width":[0,10,10,6,4,0],"height":[0,10,10,5,5,0],"texture":[15,15,4,4,17],"vertical":true,"angle":10},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":20,"z":-45},"position":{"x":[-25,-25,-25,-25,-25,-25],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"width":[0,10,10,6,4,0],"height":[0,25,25,20,24,0],"texture":[15,15,4,4,17],"vertical":true,"angle":-40},"thrust":{"section_segments":6,"offset":{"x":15,"y":65,"z":-14},"position":{"x":[0,0,0,0,0],"y":[-10,-10,0,25,20],"z":[0,0,0,0,0]},"width":[0,5,12,10,0],"height":[0,3,6,5,0],"angle":0,"propeller":true,"texture":[3.9,63,3.9,16.9]},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":8,"y":0,"z":35},"position":{"x":[0,0,0,0,0],"y":[-3,3,3,-3,-3],"z":[0,0,0,0,0]},"width":[10,10,5,5,10],"height":[20,20,15,15,20],"texture":[63]},"barrelrings2":{"section_segments":8,"offset":{"x":0,"y":-35,"z":5},"position":{"x":[0,0,0,0,0],"y":[-3,3,3,-3,-3],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[10,10,5,5,10],"texture":[63],"angle":90},"shielddetail":{"vertical":1,"section_segments":8,"offset":{"x":0,"y":0,"z":20},"position":{"x":[-35,-35,-35,-35,-35],"y":[-3,3,3,-3,-3],"z":[-15,-15,-15,-15,-15]},"width":[10,10,5,5,10],"height":[20,20,15,15,20],"texture":[4]}},"wings":{"join":{"offset":{"x":0,"y":-13,"z":0},"length":[30],"width":[10,8],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":10,"size":20}},"main":{"length":[40,20],"width":[60,50,40],"angle":[-25,20],"position":[30,70,20],"bump":{"position":-20,"size":20},"offset":{"x":0,"y":0,"z":-20},"texture":[4,11],"doubleside":true}},"typespec":{"name":"Phoenix","level":6,"model":17,"code":617,"specs":{"shield":{"capacity":[300,300],"reload":[8,10]},"generator":{"capacity":[300,300],"reload":[70,70]},"ship":{"mass":255,"speed":[117,117],"rotation":[64,64],"acceleration":[135,135]}},"shape":[3.995,4.576,4.171,3.589,2.886,2.303,1.937,1.686,1.518,1.406,1.328,1.273,1.246,2.108,2.158,2.247,2.382,2.577,2.711,2.897,3.164,3.551,3.864,3.536,3.482,3.046,3.482,3.536,3.864,3.551,3.164,2.91,2.711,2.577,2.382,2.247,2.158,2.108,2.092,1.718,1.738,1.756,1.776,1.965,2.151,2.176,1.56,1.896,2.979,3.914],"lasers":[{"x":0,"y":-3.99,"z":0,"angle":0,"damage":[9,9],"rate":10,"type":1,"speed":[50,50],"number":1,"spread":0,"error":25,"recoil":0},{"x":0,"y":-3.99,"z":0,"angle":0,"damage":[6,6],"rate":8,"type":1,"speed":[25,25],"number":1,"spread":0,"error":60,"recoil":0},{"x":0,"y":-3.99,"z":0,"angle":0,"damage":[4,4],"rate":10,"type":1,"speed":[60,60],"number":2,"spread":0,"error":10,"recoil":0}],"radius":4.576}}',
            ability: '{"name":"Phoenix","designer":"Nex","level":7,"model":17,"size":2,"zoom":0.75,"specs":{"shield":{"capacity":[400,400],"reload":[13,13]},"generator":{"capacity":[12,12],"reload":[2000,2000]},"ship":{"mass":300,"speed":[36,36],"rotation":[20,20],"acceleration":[90,90]}},"bodies":{"FIRE1":{"section_segments":0,"offset":{"x":0,"y":-135,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE2":{"section_segments":0,"offset":{"x":0,"y":-195,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE3":{"section_segments":0,"offset":{"x":0,"y":-255,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE4":{"section_segments":0,"offset":{"x":0,"y":-315,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE5":{"section_segments":0,"offset":{"x":0,"y":-375,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE6":{"section_segments":0,"offset":{"x":0,"y":-435,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE7":{"section_segments":0,"offset":{"x":0,"y":-495,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE8":{"section_segments":0,"offset":{"x":0,"y":-555,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE9":{"section_segments":0,"offset":{"x":0,"y":-615,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE10":{"section_segments":0,"offset":{"x":0,"y":-675,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE11":{"section_segments":0,"offset":{"x":0,"y":-735,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE12":{"section_segments":0,"offset":{"x":0,"y":-795,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE13":{"section_segments":0,"offset":{"x":0,"y":-855,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE14":{"section_segments":0,"offset":{"x":0,"y":-915,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE15":{"section_segments":0,"offset":{"x":0,"y":-975,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"FIRE16":{"section_segments":0,"offset":{"x":0,"y":-1035,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,10],"height":[0,0],"angle":0,"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"error":70},"propeller":false,"texture":[17]},"main":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":30,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,0,25,50,40],"z":[-10,-10,0,0,0,0,0]},"width":[0,10,40,40,15,0],"height":[0,5,20,15,15,0],"propeller":1,"texture":[1,1,4,3,17]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-95,-85,-65,-65,-55,-40,-10,-10,5,5,20,20,30,30,80,85],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2]},"width":[0,5,12,15,20,20,10,10,15,15,10,10,15,15,13,10,0],"height":[0,5,12,15,20,20,10,10,15,15,10,10,12,13,10,10,0],"propeller":false,"texture":[17,5,17,4,8,63,3,4,63,4,3,1,4,3,3],"laser":{"damage":[4,4],"rate":10,"type":1,"speed":[40,40],"number":1,"error":35}},"detail6":{"section_segments":[35,65,105,145,215,325],"offset":{"x":0,"y":20,"z":0},"position":{"x":[-20,-20,-20,-20,-20],"y":[-70,-70,-65,0,0],"z":[0,0,0,0,0]},"width":[0,4,7,20,0],"height":[0,6,10,16,0],"texture":[4,63,11],"angle":10},"ignite":{"section_segments":6,"offset":{"x":0,"y":-40,"z":0},"position":{"x":[10,25,30,30,25,5,5],"y":[-80,-60,-30,40,50,70,80],"z":[0,0,0,0,5,5,5]},"width":[0,3,3,3,3,3,0],"height":[0,3,3,3,3,3,0],"texture":[16.9,6,4,2,4,4]},"barrel":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-50},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barrel2":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-30},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barrel3":{"section_segments":8,"vertical":0,"offset":{"x":0,"y":50,"z":-20},"position":{"x":[-30,-30,-30,-30,-30,-30],"y":[-15,-15,-10,30,35,35],"z":[10,10,10,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":-30,"texture":[4,4,63,4]},"detail24":{"section_segments":8,"angle":30,"offset":{"x":0,"y":18,"z":-40},"position":{"x":[30,30,30,30,30,30],"y":[-5,-5,3,3,3,3],"z":[0,0,0,0,0,0]},"width":[0,17,17,15,10,0],"height":[0,27,27,25,23,0],"texture":[4,3,2,4,3],"vertical":1},"cockpit":{"section_segments":6,"offset":{"x":0,"y":40,"z":12},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-51,-50,-40,-28,-13,27,27],"z":[-5,-5,0,0,0,0,0]},"width":[0,5,8,10,15,10,0],"height":[0,5,4,6,8,5,0],"propeller":false,"texture":[6.9,9,9,9,8,3.9]},"reactor":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":-3},"position":{"x":[16,16,16,16,16,16],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"width":[0,10,10,6,4,0],"height":[0,10,10,5,5,0],"texture":[15,15,4,4,17],"vertical":true,"angle":10},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":20,"z":-45},"position":{"x":[-25,-25,-25,-25,-25,-25],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"width":[0,10,10,6,4,0],"height":[0,25,25,20,24,0],"texture":[15,15,4,4,17],"vertical":true,"angle":-40},"thrust":{"section_segments":6,"offset":{"x":15,"y":65,"z":-14},"position":{"x":[0,0,0,0,0],"y":[-10,-10,0,25,20],"z":[0,0,0,0,0]},"width":[0,5,12,10,0],"height":[0,3,6,5,0],"angle":0,"propeller":true,"texture":[3.9,63,3.9,16.9]},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":8,"y":0,"z":35},"position":{"x":[0,0,0,0,0],"y":[-3,3,3,-3,-3],"z":[0,0,0,0,0]},"width":[10,10,5,5,10],"height":[20,20,15,15,20],"texture":[63]},"barrelrings2":{"section_segments":8,"offset":{"x":0,"y":-35,"z":5},"position":{"x":[0,0,0,0,0],"y":[-3,3,3,-3,-3],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[10,10,5,5,10],"texture":[63],"angle":90},"shielddetail":{"vertical":1,"section_segments":8,"offset":{"x":0,"y":0,"z":20},"position":{"x":[-35,-35,-35,-35,-35],"y":[-3,3,3,-3,-3],"z":[-15,-15,-15,-15,-15]},"width":[10,10,5,5,10],"height":[20,20,15,15,20],"texture":[4]}},"wings":{"join":{"offset":{"x":0,"y":-13,"z":0},"length":[30],"width":[10,8],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":10,"size":20}},"main":{"length":[40,20],"width":[60,50,40],"angle":[-25,20],"position":[30,70,20],"bump":{"position":-20,"size":20},"offset":{"x":0,"y":0,"z":-20},"texture":[4,11],"doubleside":true}},"typespec":{"name":"Phoenix","level":7,"model":17,"code":717,"specs":{"shield":{"capacity":[400,400],"reload":[13,13]},"generator":{"capacity":[12,12],"reload":[2000,2000]},"ship":{"mass":300,"speed":[36,36],"rotation":[20,20],"acceleration":[90,90]}},"shape":[4.205,4.817,4.391,3.778,3.038,2.424,2.039,1.775,1.598,1.48,1.398,1.34,1.311,2.219,2.272,2.365,2.508,2.712,2.854,3.05,3.331,3.738,4.067,3.722,3.665,3.206,3.665,3.722,4.067,3.738,3.331,3.063,2.854,2.712,2.508,2.365,2.272,2.219,2.202,1.809,1.83,1.849,1.87,2.069,2.264,2.29,1.643,1.996,3.136,4.12],"lasers":[{"x":0,"y":-5.4,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-7.8,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-10.2,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-12.6,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-15,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-17.4,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-19.8,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-22.2,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-24.6,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-27,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-29.4,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-31.8,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-34.2,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-36.6,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-39,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-41.4,"z":0,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[30,30],"number":1,"spread":0,"error":70,"recoil":0},{"x":0,"y":-4.2,"z":0,"angle":0,"damage":[4,4],"rate":10,"type":1,"speed":[40,40],"number":1,"spread":0,"error":35,"recoil":0}],"radius":4.817}}'
        },
        name: "Firewall",
        cooldown: 36 * 60,
        duration: 6 * 60,
        endOnDeath: true
    },
    "Goliath": {
        models: {
            default: '{"name":"Goliath","level":6,"model":18,"size":2.65,"specs":{"shield":{"capacity":[760,760],"reload":[15,15]},"generator":{"capacity":[180,180],"reload":[55,55]},"ship":{"mass":750,"speed":[50,63],"rotation":[25,31],"acceleration":[100,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-95,-90,-40,-10,10,50,90,90,90],"z":[-10,-10,-10,-10,-10,-10,-10,-10,-10,-10]},"width":[10,20,25,30,35,35,25,15,0],"height":[0,10,10,15,15,20,15,10,0],"texture":[2,10,11,4,11,11,63,12]},"cannon":{"section_segments":8,"offset":{"x":15.5,"y":-10,"z":25},"position":{"x":[0,0,0,0,0,0,0,null],"y":[-50,-60,-25,-25,0,10,20,null],"z":[0,0,0,0,0,0,0,null]},"width":[0,5,6,8,8,8,0,null],"height":[0,5,6,8,8,8,0,null],"texture":[3,3,4,8],"angle":0,"laser":{"damage":[50,50],"rate":2,"type":1,"speed":[160,180],"number":1,"error":5}},"cannon2":{"section_segments":8,"offset":{"x":0,"y":-10,"z":25},"position":{"x":[0,0,0,0,0,0,0,null],"y":[-50,-60,-25,-25,0,10,20,null],"z":[0,0,0,0,0,0,0,null]},"width":[0,5,6,8,8,8,0,null],"height":[0,5,6,8,8,8,0,null],"texture":[3,3,4,8],"angle":0,"laser":{"damage":[50,50],"rate":2,"type":1,"speed":[160,180],"number":1,"error":5}},"toppropulsors":{"section_segments":10,"offset":{"x":10,"y":30,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,12,12,12,10,10,12,10,0],"texture":[3,4,10,3,3,63,4],"propeller":true},"bottompropulsors":{"section_segments":10,"offset":{"x":10,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,12,12,12,10,10,12,10,0],"texture":[3,4,10,3,3,63,4],"propeller":true},"side_connector":{"section_segments":12,"offset":{"x":45,"y":-10,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-20,-3,0,-1,4,3,15,15,20,25,25],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,18,16,16,13,12,16,18,20,0],"height":[0,20,20,18,16,16,13,12,16,18,20,0],"propeller":false,"texture":[4,13,4,8,4,17,3,18,4,12,4],"vertical":1,"angle":110},"sidebodies":{"section_segments":10,"offset":{"x":65,"y":20,"z":-25},"position":{"x":[-10,-10,-10,-10,-10,15,15,15,0,-35,-25],"y":[-100,-100,-90,-70,-70,-40,-10,20,50,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,10,10,15,15,15,15,15,5,0],"height":[0,10,10,10,15,20,20,20,20,10,0],"texture":[4,63,15,18,63,8,8,11,63,18]},"sidebodies2":{"section_segments":10,"offset":{"x":60,"y":20,"z":-20},"position":{"x":[-20,5,10,20],"y":[-70,-40,-10,20],"z":[0,0,0,0,0,0]},"width":[0,15,15,15],"height":[0,5,5,5],"texture":[4,2,3]},"barrelrings3":{"section_segments":8,"offset":{"x":81,"y":10,"z":-25},"position":{"x":[0,0,0,0,0,0,null],"y":[-12.5,12.5,12.5,-12.5,-12.5,-12.5,null],"z":[0,0,0,0,0,0,null]},"width":[21.6,21.6,12.6,12.6,21.6,0,null],"height":[21.6,21.6,12.6,12.6,21.6,0,null],"texture":[63]},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":65,"y":-28,"z":40},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[25,25,20,20,25],"texture":[63],"angle":0},"bumper":{"section_segments":6,"offset":{"x":1,"y":-115,"z":-10},"position":{"x":[0,0,0,-5,-5,0,0],"y":[-10,10,15,25,27],"z":[0,0,0,0,0,0,0]},"width":[5,5,5,5,0],"height":[10,10,8,6,0],"texture":[63,16.9,3.9],"angle":90},"shield":{"section_segments":8,"vertical":1,"offset":{"x":100,"y":-13,"z":-10},"position":{"x":[-10,-10,0,0,-10,-10],"y":[-40,-40,-20,0,20,20],"z":[0,0,0,0,0,0]},"width":[5,5,8,8,5,0],"height":[0,10,20,20,10,0],"texture":[4,3,63,4,4],"angle":0},"cockpitWindshield":{"section_segments":3,"offset":{"x":0,"y":-78,"z":2},"position":{"x":[-20,0,5,0,-20,0,0],"y":[-20,-10,0,10,20],"z":[-6,-2,0,-2,-6,0,0]},"width":[0,12,12,12,0],"height":[0,5,5,5,0],"texture":[8.6],"angle":90},"cockpitBack":{"section_segments":6,"offset":{"x":0,"y":-28,"z":-1},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-20,0,20,23],"z":[-2,0,0,0,0,0,0]},"width":[15,15,15,13,0],"height":[0,10,10,10,0],"texture":[4,10,17.9,3.9],"angle":0},"cockpitBackSides":{"section_segments":6,"offset":{"x":13,"y":-38,"z":-1},"position":{"x":[5,0,0,0,0,0,0],"y":[-20,-10,0,3],"z":[-3,0,0,0,0,0,0]},"width":[0,7,7,0],"height":[0,5,5,0],"texture":[4,17,4,3],"angle":0},"turret":{"section_segments":10,"angle":0,"offset":{"x":0,"y":20,"z":-20},"position":{"x":[0,0,0,0,0,null],"y":[-5,-5,15,20,20,null],"z":[0,0,0,0,0,null]},"width":[0,40,40,30,0,null],"height":[0,40,40,30,0,null],"texture":[2,2,1,3],"vertical":true},"turret2":{"section_segments":8,"angle":0,"offset":{"x":0,"y":30,"z":-20},"position":{"x":[0,0,0,0,null],"y":[10,15,11,12,null],"z":[0,0,0,0,null]},"width":[25,20,15,0,null],"height":[25,20,15,0,null],"texture":[63,4,17],"vertical":true},"supportbeam":{"section_segments":10,"angle":0,"offset":{"x":0,"y":10,"z":-20},"position":{"x":[0,0,0,0,0,null],"y":[-15,-15,15,20,30,null],"z":[0,0,0,0,0,null]},"width":[0,30,30,15,0,null],"height":[0,30,30,15,0,null],"texture":[3,4,4,4],"vertical":true},"side":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":15,"y":20,"z":25},"position":{"x":[0,0,0,0,null],"y":[0,26,28,28,null],"z":[0,0,0,0,null]},"width":[15,14,5,0,null],"height":[6,6,5,0,null],"texture":[63,4,4],"angle":90},"side2":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":12,"y":10.5,"z":25},"position":{"x":[0,0,0,0,null],"y":[0,26,28,28,null],"z":[0,0,0,0,null]},"width":[15,14,5,0,null],"height":[6,6,5,0,null],"texture":[63,4,4],"angle":125},"side3":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":12.5,"y":29,"z":25},"position":{"x":[0,0,0,0,null],"y":[0,26,28,28,null],"z":[0,0,0,0,null]},"width":[15,14,5,0,null],"height":[6,6,5,0,null],"texture":[63,4,4],"angle":53},"side4":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":4,"y":35,"z":25},"position":{"x":[0,0,0,0,null],"y":[0,26,28,28,null],"z":[0,0,0,0,null]},"width":[15,14,5,0,null],"height":[6,6,5,0,null],"texture":[63,4,4],"angle":19.5},"side5":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":3,"z":25},"position":{"x":[0,0,0,0],"y":[0,25,28,25],"z":[0,0,0,0]},"width":[30,30,5,0],"height":[10,11,5,0],"texture":[63,4,4],"angle":180}},"wings":{"cockpitTop":{"doubleside":false,"offset":{"x":0,"y":-68,"z":7},"length":[10,13],"width":[30,20,4],"angle":[-11,-42],"position":[0,0,11],"texture":[11.5,9],"bump":{"position":20,"size":3}},"cockpitTopBack":{"doubleside":false,"offset":{"x":0,"y":-55,"z":6.800000000000001},"length":[10,13],"width":[10,10,20],"angle":[-11,-42],"position":[0,0,10],"texture":[4],"bump":{"position":20,"size":3}},"join":{"doubleside":1,"offset":{"x":0,"y":-30,"z":-15},"length":[61],"width":[20,10],"angle":[-10],"position":[10,0,0,50],"texture":[63],"bump":{"position":10,"size":20}},"join2":{"doubleside":1,"offset":{"x":0,"y":50,"z":-15},"length":[61],"width":[20,10],"angle":[-10],"position":[-10,10,0,50],"texture":[63],"bump":{"position":10,"size":20}}},"typespec":{"name":"Goliath","level":6,"model":18,"code":618,"specs":{"shield":{"capacity":[760,760],"reload":[15,15]},"generator":{"capacity":[180,180],"reload":[55,55]},"ship":{"mass":750,"speed":[50,63],"rotation":[25,31],"acceleration":[100,100]}},"shape":[6.337,6.381,6.272,4.043,5.022,5.415,5.305,5.19,5.187,5.026,4.996,5.107,5.636,5.748,5.744,5.655,5.427,5.489,5.605,5.558,5.45,5.489,5.611,5.572,4.316,4.248,4.316,5.572,5.611,5.489,5.45,5.558,5.605,5.489,5.427,5.655,5.744,5.748,5.636,5.107,4.996,5.026,5.187,5.19,5.305,5.415,5.022,4.043,6.272,6.381],"lasers":[{"x":0.822,"y":-3.71,"z":1.325,"angle":0,"damage":[50,50],"rate":2,"type":1,"speed":[160,180],"number":1,"spread":0,"error":5,"recoil":0},{"x":-0.822,"y":-3.71,"z":1.325,"angle":0,"damage":[50,50],"rate":2,"type":1,"speed":[160,180],"number":1,"spread":0,"error":5,"recoil":0},{"x":0,"y":-3.71,"z":1.325,"angle":0,"damage":[50,50],"rate":2,"type":1,"speed":[160,180],"number":1,"spread":0,"error":5,"recoil":0}],"radius":6.381}}',
            ability: '{"name":"Turret","level":7,"model":18,"size":3.5,"zoom":0.8,"specs":{"shield":{"capacity":[800,800],"reload":[25,25]},"generator":{"capacity":[50,50],"reload":[200,200]},"ship":{"mass":10000,"speed":[1e-10,1e-10],"rotation":[15,15],"acceleration":[150,150]}},"bodies":{"main":{"section_segments":10,"angle":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,20,20],"z":[0,0,0,0,0]},"width":[0,40,40,30,0],"height":[0,40,40,30,0],"texture":[2,2,1,3],"vertical":true},"main2":{"section_segments":8,"angle":0,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0],"y":[10,15,11,12],"z":[0,0,0,0]},"width":[25,20,15,0],"height":[25,20,15,0],"texture":[63,4,17],"vertical":true},"supportbeam":{"section_segments":10,"angle":0,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,15,20,20],"z":[0,0,0,0,0]},"width":[0,25,40,15,0],"height":[0,25,40,15,0],"texture":[3,4,4,4],"vertical":true},"cannon":{"section_segments":8,"offset":{"x":15.5,"y":-30,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-60,-25,-25,0,10,20],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,8,8,8,0],"height":[0,5,6,8,8,8,0],"texture":[3,3,4,8],"angle":0,"laser":{"damage":[50,50],"rate":2,"type":1,"speed":[190,190],"number":1,"error":0}},"cannon2":{"section_segments":8,"offset":{"x":0,"y":-30,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-60,-25,-25,0,10,20],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,8,8,8,0],"height":[0,5,6,8,8,8,0],"texture":[3,3,4,8],"angle":0,"laser":{"damage":[50,50],"rate":2,"type":1,"speed":[190,190],"number":1,"error":0}},"side":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":15,"y":0,"z":5},"position":{"x":[0,0,0,0],"y":[0,26,28,28],"z":[0,0,0,0]},"width":[15,14,5,0],"height":[6,6,5,0],"texture":[63,4,4],"angle":90},"side2":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":12,"y":-9.5,"z":5},"position":{"x":[0,0,0,0],"y":[0,26,28,28],"z":[0,0,0,0]},"width":[15,14,5,0],"height":[6,6,5,0],"texture":[63,4,4],"angle":125},"side3":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":12.5,"y":9,"z":5},"position":{"x":[0,0,0,0],"y":[0,26,28,28],"z":[0,0,0,0]},"width":[15,14,5,0],"height":[6,6,5,0],"texture":[63,4,4],"angle":53},"side4":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":4,"y":15,"z":5},"position":{"x":[0,0,0,0],"y":[0,26,28,28],"z":[0,0,0,0]},"width":[15,14,5,0],"height":[6,6,5,0],"texture":[63,4,4],"angle":19.5},"side5":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":-17,"z":5},"position":{"x":[0,0,0,0],"y":[0,25,28,25],"z":[0,0,0,0]},"width":[30,30,5,0],"height":[10,11,5,0],"texture":[63,4,4],"angle":180}},"typespec":{"name":"Turret","level":7,"model":18,"code":718,"specs":{"shield":{"capacity":[800,800],"reload":[25,25]},"generator":{"capacity":[50,50],"reload":[200,200]},"ship":{"mass":10000,"speed":[1e-10,1e-10],"rotation":[15,15],"acceleration":[150,150]}},"shape":[6.31,6.414,6.461,4.796,3.851,3.197,3.037,3.05,3.038,3.019,2.984,3.009,3.024,3.024,3.009,3.013,3.036,3.054,3.049,3.038,3.002,3.03,3.05,3.066,3.054,3.036,3.054,3.066,3.05,3.03,3.002,3.038,3.049,3.054,3.036,3.013,3.009,3.024,3.024,3.009,2.984,3.019,3.038,3.05,3.037,3.197,3.851,4.796,6.461,6.414],"lasers":[{"x":1.085,"y":-6.3,"z":0.35,"angle":0,"damage":[50,50],"rate":2,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.085,"y":-6.3,"z":0.35,"angle":0,"damage":[50,50],"rate":2,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-6.3,"z":0.35,"angle":0,"damage":[50,50],"rate":2,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.461}}'
        },
        name: "Turret",
        cooldown: 30 * 60,
        duration: 10 * 60,
        endOnDeath: true
    },
    "Kunai": {
        models: {
            default: '{"name":"Kunai","level":6,"model":19,"size":1.76,"zoom":0.9,"specs":{"shield":{"capacity":[260,260],"reload":[6,6]},"generator":{"capacity":[140,140],"reload":[56,56]},"ship":{"mass":190,"speed":[140,140],"rotation":[70,70],"acceleration":[110,110]}},"bodies":{"minion_bubble_gun":{"section_segments":12,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-130,-115,-90,-65,-30,0,30,45,40],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,8,10,15,15,15,12,0],"height":[0,5,7,10,15,15,13,10,0],"texture":[4,3,8,15.1,3,15.1,63,17],"propeller":true,"laser":{"damage":[140,140],"rate":10,"type":2,"speed":[1000,1000],"number":100,"error":1000,"recoil":1000}},"C1":{"section_segments":6,"offset":{"x":50,"y":-5,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C2":{"section_segments":6,"offset":{"x":45,"y":-20,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C3":{"section_segments":6,"offset":{"x":40,"y":-35,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C4":{"section_segments":6,"offset":{"x":35,"y":-50,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C5":{"section_segments":6,"offset":{"x":30,"y":-65,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C6":{"section_segments":6,"offset":{"x":25,"y":-80,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C7":{"section_segments":6,"offset":{"x":20,"y":-95,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C8":{"section_segments":6,"offset":{"x":15,"y":-110,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C9":{"section_segments":6,"offset":{"x":10,"y":-125,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C10":{"section_segments":6,"offset":{"x":5,"y":-140,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"C11":{"section_segments":6,"offset":{"x":0,"y":-155,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"angle":0,"laser":{"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"error":0},"propeller":false,"texture":[17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-5,"z":1.5},"position":{"x":[0,0,0,0,0,0],"y":[-45,-25,-3,15,55],"z":[8,8,9,10,5,10]},"width":[2,8,10,10,0],"height":[0,8,10,8,0],"texture":[9,9,63,15.1,3]},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":50,"y":-5,"z":-30},"position":{"x":[0,0,0,0,0],"y":[-3,3,5,-5,-3],"z":[0,0,0,0,0]},"width":[27,27,22,22,27],"height":[30,30,23,23,30],"texture":[15.8],"angle":15},"barrelrings2":{"vertical":1,"section_segments":8,"offset":{"x":50,"y":-5,"z":-30},"position":{"x":[0,0,0,0],"y":[0,0,0,8],"z":[0,0,0,0]},"width":[18,11,6,0],"height":[18,11,6,0],"texture":[15,111,5],"angle":15},"top":{"section_segments":12,"offset":{"x":30,"y":70,"z":0},"position":{"x":[-2,0,0,-3,-10],"y":[-30,-20,0,20,35],"z":[0,0,0,10,25]},"width":[0,5,7,6,0],"height":[0,5,7,6,0],"texture":[3,4,63,3],"propeller":true,"angle":-5},"top2":{"section_segments":12,"offset":{"x":30,"y":70,"z":0},"position":{"x":[-20,-15,-10,5,15],"y":[-30,-20,0,20,30],"z":[0,0,-2,-12,-8]},"width":[0,5,7,6,0],"height":[0,5,7,6,0],"texture":[3,15,63,3],"propeller":true,"angle":-5},"sides":{"section_segments":12,"offset":{"x":12,"y":-10,"z":0},"position":{"x":[-3,0,0,5,-3],"y":[-15,-20,0,30,55],"z":[0,0,0,0,0,0]},"width":[0,8,10,8,0],"height":[0,6,7,6,0],"texture":[3,3,63,3],"propeller":true},"propulsors":{"section_segments":8,"offset":{"x":40,"y":-30,"z":-18},"position":{"x":[-3,0,0,0,0,0,0,0,0,0,0],"y":[30,50,60,80,95,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[5,8,9,9,9,8,0],"height":[0,9,9,9,9,8,0],"texture":[4,3,4,11,63,17],"propeller":1}},"wings":{"wings1":{"doubleside":true,"offset":{"x":4,"y":25,"z":-5},"length":[15,30],"width":[50,120,50],"angle":[0,-20],"position":[0,-30,30],"texture":[111,15.1],"bump":{"position":10,"size":0}},"wings2":{"doubleside":true,"offset":{"x":3,"y":-7,"z":2},"length":[10,28],"width":[30,40,25],"angle":[0,-20],"position":[0,15,35],"texture":[63],"bump":{"position":10,"size":5}},"wings3":{"doubleside":true,"offset":{"x":0,"y":-20,"z":1},"length":[8,18],"width":[50,130,50],"angle":[0,-20],"position":[0,-30,30],"texture":[111,63],"bump":{"position":10,"size":0}},"side_joins":{"offset":{"x":0,"y":55,"z":-3},"length":[30],"width":[90,30],"angle":[10],"position":[-50,15],"texture":[4],"bump":{"position":10,"size":10}},"spoiler":{"offset":{"x":0,"y":45,"z":10},"length":[10,30,22],"width":[15,30,18,12],"angle":[90,20,-10],"position":[0,15,25,40],"texture":[1,2,3],"bump":{"position":10,"size":15}}},"typespec":{"name":"Kunai","level":6,"model":19,"code":619,"specs":{"shield":{"capacity":[260,260],"reload":[6,6]},"generator":{"capacity":[140,140],"reload":[56,56]},"ship":{"mass":190,"speed":[140,140],"rotation":[70,70],"acceleration":[110,110]}},"shape":[3.872,4.058,2.724,2.268,1.938,1.694,1.548,1.443,1.363,1.318,1.295,1.307,1.344,2.449,2.642,2.904,2.939,3.022,3.031,2.872,3.089,3.649,3.861,3.643,3.709,2.667,3.709,3.643,3.861,3.649,3.089,2.872,3.031,3.022,2.939,2.904,2.642,2.449,1.787,1.307,1.295,1.318,1.363,1.443,1.548,1.694,1.938,2.268,2.724,4.058],"lasers":[{"x":0,"y":-3.872,"z":0,"angle":0,"damage":[140,140],"rate":10,"type":2,"speed":[1000,1000],"number":100,"spread":0,"error":1000,"recoil":1000},{"x":1.76,"y":-0.176,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.76,"y":-0.176,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.584,"y":-0.704,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.584,"y":-0.704,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.408,"y":-1.232,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.408,"y":-1.232,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.232,"y":-1.76,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.232,"y":-1.76,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.056,"y":-2.288,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.056,"y":-2.288,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.88,"y":-2.816,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.88,"y":-2.816,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.704,"y":-3.344,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.704,"y":-3.344,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.528,"y":-3.872,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.528,"y":-3.872,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.352,"y":-4.4,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.352,"y":-4.4,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.176,"y":-4.928,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.176,"y":-4.928,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-5.456,"z":0,"angle":0,"damage":[6.666666666666667,6.666666666666667],"rate":0.4,"type":1,"speed":[300,300],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.058}}'
        },
        name: "Boogie Woogie",
        cooldown: 9 * 60,
        duration: 1,

        showAbilityRangeUI: true,
        includeRingOnModel: true,

        range: 60,

        start: function (ship) {
            let target = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true })[0];
            if (target != null) {
                ship.set({x: target.x, y: target.y, vx: target.vx, vy: target.vy, angle: target.r * 180 / Math.PI});
                target.set({x: ship.x, y: ship.y, vx: ship.vx, vy: ship.vy, angle: ship.r * 180 / Math.PI});
            }
            // ship.set({invulnerable: 120});
        },

        end: function () {}
    },
    "Lancelot": {
        models: {
            default: '{"name":"Lancelot","designer":"nex","level":6,"model":20,"size":1.3,"specs":{"shield":{"capacity":[300,300],"reload":[7,7]},"generator":{"capacity":[340,340],"reload":[85,85]},"ship":{"mass":300,"speed":[120,120],"rotation":[50,50],"acceleration":[145,145]}},"bodies":{"sword1":{"section_segments":0,"offset":{"x":50,"y":-160,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword2":{"section_segments":0,"offset":{"x":50,"y":-240,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword3":{"section_segments":0,"offset":{"x":50,"y":-320,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword4":{"section_segments":0,"offset":{"x":50,"y":-400,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword5":{"section_segments":0,"offset":{"x":50,"y":-480,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword6":{"section_segments":0,"offset":{"x":50,"y":-560,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword7":{"section_segments":0,"offset":{"x":50,"y":-640,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword8":{"section_segments":0,"offset":{"x":50,"y":-720,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword9":{"section_segments":0,"offset":{"x":50,"y":-800,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword10":{"section_segments":0,"offset":{"x":50,"y":-880,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword11":{"section_segments":0,"offset":{"x":35,"y":-960,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword12":{"section_segments":0,"offset":{"x":20,"y":-1040,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword13":{"section_segments":0,"offset":{"x":0,"y":-1120,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword14":{"section_segments":0,"offset":{"x":0,"y":-160,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword15":{"section_segments":0,"offset":{"x":0,"y":-240,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword16":{"section_segments":0,"offset":{"x":0,"y":-320,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword17":{"section_segments":0,"offset":{"x":0,"y":-400,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword18":{"section_segments":0,"offset":{"x":0,"y":-480,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword19":{"section_segments":0,"offset":{"x":0,"y":-560,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword20":{"section_segments":0,"offset":{"x":0,"y":-640,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword21":{"section_segments":0,"offset":{"x":0,"y":-720,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword22":{"section_segments":0,"offset":{"x":0,"y":-800,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword23":{"section_segments":0,"offset":{"x":0,"y":-880,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"sword24":{"section_segments":0,"offset":{"x":0,"y":-960,"z":0},"position":{"x":[0,0],"y":[0,-20],"z":[0,0]},"width":[15,0],"height":[0,0],"angle":0,"laser":{"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"error":0},"propeller":false,"texture":[17]},"handle":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-70,-80,-65,-50,-20,15,50,45,80,120,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,11,18,22,16,16,21,27,40,30,0],"height":[0,7,13,16,11,12,15,20,30,20,0],"texture":[1,2,3,2,10,2,18,18,4,17],"propeller":true,"laser":{"damage":[340,340],"rate":10,"type":2,"speed":[1,1],"number":20,"error":360}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":25,"z":3},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-54,-35,-10,10,40,60],"z":[0,0,0,0,3,8,10]},"width":[0,9,13,14,13,10,0],"height":[0,10,15,15,13,10,0],"texture":[7,9,9,4],"propeller":false},"support_pulsors":{"section_segments":8,"offset":{"x":43,"y":90,"z":24},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-28,-35,-10,0,10,45,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,15,20,15,25,19,0],"height":[0,7,15,20,15,25,19,0],"texture":[1,13,2,4,4,8,17],"propeller":1},"pulsors_support":{"section_segments":8,"offset":{"x":20,"y":40,"z":-15},"position":{"x":[0,0,0,0,0,0,0],"y":[-38,-35,-10,0,10,45,30],"z":[0,0,0,0,0,0,0]},"width":[0,12,16,11,20,16,0],"height":[0,10,13,11,15,15,0],"texture":[3,10,4,4,1],"propeller":false},"handguard":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-25,"y":-75,"z":0},"position":{"x":[-15,-5,3,-7,-6,20,0],"y":[-125,-115,-90,-55,-25,0,30],"z":[0,0,0,0,0,0,-9]},"width":[0,6,10,14,19,27,15],"height":[0,6,13,13,20,25,5],"texture":[4,3,2,3,4,5],"angle":80},"handguardofthehandguard":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-25,"y":-75,"z":-21},"position":{"x":[-10,-2.5,3,-7,-6,0,0],"y":[-105,-95,-75,-50,-30,0,30],"z":[0,0,0,0,0,-5,0]},"width":[0,6,10,14,19,27,15],"height":[0,6,13,13,20,25,5],"texture":[5,4,3,4,5,5],"angle":115},"covering_the_bad_parts_with_more_bodies_heck_yeah_dont_remove_this_please":{"section_segments":8,"offset":{"x":0,"y":-61,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-30,-10,10,53],"z":[5,5,0,0,-4,5]},"width":[0,16,18,28,16,0],"height":[0,16,22,26,22,0],"texture":[13,1,63,3,4],"angle":0,"vertical":false},"eye":{"section_segments":8,"angle":0,"offset":{"x":0,"y":27,"z":80},"position":{"x":[0,0,0,0,0],"y":[-7,-7,6,2,6],"z":[0,0,0,0,0]},"width":[0,15,10,6,0],"height":[0,30,16,10,0],"texture":[4,4,17,5],"vertical":true},"ring":{"section_segments":12,"offset":{"x":60,"y":110,"z":6},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,13,26,18,13,5,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,27,27,24,19,0,18,18],"height":[18,18,18,27,27,24,19,0,18,18],"texture":[4,3,4,3,1,18,17],"vertical":false,"angle":90}},"wings":{"plasmacutters":{"offset":{"x":5,"y":-70,"z":0},"length":[8,9,8],"width":[30,70,70,30],"angle":[0,0,0],"position":[-20,-60,-45,-20],"texture":[17,75,2],"doubleside":true,"bump":{"position":0,"size":5}},"guardthing":{"offset":{"x":0,"y":-42,"z":0},"length":[45],"width":[105,10],"angle":[5],"position":[15,-40],"texture":[63],"doubleside":true,"bump":{"position":-15,"size":10}},"guardsomething":{"offset":{"x":0,"y":-70,"z":-4},"length":[85],"width":[60,10],"angle":[0],"position":[20,-10],"texture":[4],"doubleside":true,"bump":{"position":0,"size":5}},"coolhandguardthingfudgenamingstuff":{"offset":{"x":0,"y":-83,"z":0},"length":[95],"width":[50,15],"angle":[0],"position":[2,0],"texture":[63],"doubleside":true,"bump":{"position":15,"size":20}},"wi":{"offset":{"x":15,"y":75,"z":14},"length":[0,55],"width":[0,60,10],"angle":[80,80],"position":[0,0,40],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}},"ng":{"offset":{"x":0,"y":75,"z":14},"length":[0,55],"width":[0,60,10],"angle":[90,90],"position":[-10,-10,50],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}},"shield_top":{"offset":{"x":30,"y":110,"z":-10},"length":[30,45,40],"width":[40,100,90,40],"angle":[0,90,110],"position":[-30,0,0,0],"texture":[4,8,63],"doubleside":true,"bump":{"position":0,"size":11}},"shield_bot":{"offset":{"x":35,"y":80,"z":0},"length":[-10,25,40],"width":[0,100,90,40],"angle":[-90,-90,-110],"position":[0,0,0,0],"texture":[63,4,63],"doubleside":true,"bump":{"position":0,"size":11}}},"typespec":{"name":"Lancelot","level":6,"model":20,"code":620,"specs":{"shield":{"capacity":[300,300],"reload":[7,7]},"generator":{"capacity":[340,340],"reload":[85,85]},"ship":{"mass":300,"speed":[120,120],"rotation":[50,50],"acceleration":[145,145]}},"shape":[3.329,4.303,3.494,2.824,2.956,3.147,3.586,4.206,4.452,4.46,3.048,3.066,0.419,0.634,0.872,0.929,1.014,1.132,1.537,3.506,4.14,4.132,4.443,3.69,3.573,3.38,3.573,3.69,4.443,4.132,4.14,3.506,1.537,1.132,1.014,0.929,0.872,0.634,0.419,3.066,3.048,4.46,4.452,4.206,3.586,3.147,2.956,2.824,3.494,4.303],"lasers":[{"x":1.3,"y":-4.68,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-4.68,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-6.76,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-6.76,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-8.84,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-8.84,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-10.92,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-10.92,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-13,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-13,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-15.08,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-15.08,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-17.16,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-17.16,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-19.24,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-19.24,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-21.32,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-21.32,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-23.4,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-23.4,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.91,"y":-25.48,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.91,"y":-25.48,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.52,"y":-27.56,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.52,"y":-27.56,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-29.64,"z":0,"angle":0,"damage":[7.916666666666667,7.916666666666667],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-4.68,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-6.76,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-8.84,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-10.92,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-13,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-15.08,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-17.16,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-19.24,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-21.32,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-23.4,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-25.48,"z":0,"angle":0,"damage":[12.916666666666668,12.916666666666668],"rate":0.25,"type":1,"speed":[25,25],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.08,"z":0,"angle":0,"damage":[340,340],"rate":10,"type":2,"speed":[1,1],"number":20,"spread":0,"error":360,"recoil":0}],"radius":4.46}}',
            ability: '{"name":"Lancelot","designer":"nex","level":7,"model":20,"size":1.35,"specs":{"shield":{"capacity":[400,400],"reload":[10,10]},"generator":{"capacity":[350,350],"reload":[500,500]},"ship":{"mass":540,"speed":[135,135],"rotation":[55,55],"acceleration":[85,85]}},"bodies":{"sword1":{"section_segments":0,"offset":{"x":60,"y":-165,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword14":{"section_segments":0,"offset":{"x":0,"y":-165,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword2":{"section_segments":0,"offset":{"x":60,"y":-250,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword15":{"section_segments":0,"offset":{"x":0,"y":-250,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword3":{"section_segments":0,"offset":{"x":60,"y":-335,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword16":{"section_segments":0,"offset":{"x":0,"y":-335,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword4":{"section_segments":0,"offset":{"x":60,"y":-420,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"word17":{"section_segments":0,"offset":{"x":0,"y":-420,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword5":{"section_segments":0,"offset":{"x":60,"y":-505,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword18":{"section_segments":0,"offset":{"x":0,"y":-505,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword6":{"section_segments":0,"offset":{"x":60,"y":-590,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword19":{"section_segments":0,"offset":{"x":0,"y":-590,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword7":{"section_segments":0,"offset":{"x":60,"y":-675,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword20":{"section_segments":0,"offset":{"x":0,"y":-675,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword8":{"section_segments":0,"offset":{"x":60,"y":-760,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword21":{"section_segments":0,"offset":{"x":0,"y":-760,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword9":{"section_segments":0,"offset":{"x":60,"y":-845,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword22":{"section_segments":0,"offset":{"x":24,"y":-845,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword10":{"section_segments":0,"offset":{"x":60,"y":-930,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword23":{"section_segments":0,"offset":{"x":0,"y":-930,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword11":{"section_segments":0,"offset":{"x":42,"y":-1015,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword12":{"section_segments":0,"offset":{"x":24,"y":-1100,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"sword13":{"section_segments":0,"offset":{"x":0,"y":-1185,"z":0},"position":{"x":[0,0],"y":[0,20],"z":[0,0]},"width":[0,15],"height":[0,0],"angle":180,"laser":{"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"error":0},"propeller":false,"texture":[17]},"handle":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-70,-80,-65,-50,-20,15,50,45,80,120,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,11,18,22,16,16,21,27,40,30,0],"height":[0,7,13,16,11,12,15,20,30,20,0],"texture":[1,2,3,2,10,2,18,18,4,17],"propeller":true,"laser":{"damage":[350,350],"rate":10,"type":2,"speed":[1,1],"number":20,"error":360}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":25,"z":3},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-54,-35,-10,10,40,60],"z":[0,0,0,0,3,8,10]},"width":[0,9,13,14,13,10,0],"height":[0,10,15,15,13,10,0],"texture":[7,9,9,4],"propeller":false},"support_pulsors":{"section_segments":8,"offset":{"x":43,"y":90,"z":24},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-28,-35,-10,0,10,45,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,15,20,15,25,19,0],"height":[0,7,15,20,15,25,19,0],"texture":[1,13,2,4,4,8,17],"propeller":1},"pulsors_support":{"section_segments":8,"offset":{"x":20,"y":40,"z":-15},"position":{"x":[0,0,0,0,0,0,0],"y":[-38,-35,-10,0,10,45,30],"z":[0,0,0,0,0,0,0]},"width":[0,12,16,11,20,16,0],"height":[0,10,13,11,15,15,0],"texture":[3,10,4,4,1],"propeller":false},"handguard":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-25,"y":-75,"z":0},"position":{"x":[-15,-5,3,-7,-6,20,0],"y":[-125,-115,-90,-55,-25,0,30],"z":[0,0,0,0,0,0,-9]},"width":[0,6,10,14,19,27,15],"height":[0,6,13,13,20,25,5],"texture":[4,3,2,3,4,5],"angle":80},"handguardofthehandguard":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-25,"y":-75,"z":-21},"position":{"x":[-10,-2.5,3,-7,-6,0,0],"y":[-105,-95,-75,-50,-30,0,30],"z":[0,0,0,0,0,-5,0]},"width":[0,6,10,14,19,27,15],"height":[0,6,13,13,20,25,5],"texture":[5,4,3,4,5,5],"angle":115},"covering_the_bad_parts_with_more_bodies_hell_yeah_dont_remove_this_please":{"section_segments":8,"offset":{"x":0,"y":-61,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-30,-10,10,53],"z":[5,5,0,0,-4,5]},"width":[0,16,18,28,16,0],"height":[0,16,22,26,22,0],"texture":[13,1,63,3,4],"angle":0,"vertical":false},"eye":{"section_segments":8,"angle":0,"offset":{"x":0,"y":27,"z":80},"position":{"x":[0,0,0,0,0],"y":[-7,-7,6,2,6],"z":[0,0,0,0,0]},"width":[0,15,10,6,0],"height":[0,30,16,10,0],"texture":[4,4,17,5],"vertical":true},"ring":{"section_segments":12,"offset":{"x":60,"y":110,"z":6},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,13,26,18,13,5,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,27,27,24,19,0,18,18],"height":[18,18,18,27,27,24,19,0,18,18],"texture":[4,3,4,3,1,18,17],"vertical":false,"angle":90}},"wings":{"plasmacutters":{"offset":{"x":5,"y":-70,"z":0},"length":[8,9,8],"width":[30,70,70,30],"angle":[0,0,0],"position":[-20,-60,-45,-20],"texture":[17,75,2],"doubleside":true,"bump":{"position":0,"size":5}},"guardthing":{"offset":{"x":0,"y":-42,"z":0},"length":[45],"width":[105,10],"angle":[5],"position":[15,-40],"texture":[63],"doubleside":true,"bump":{"position":-15,"size":10}},"guardsomething":{"offset":{"x":0,"y":-70,"z":-4},"length":[85],"width":[60,10],"angle":[0],"position":[20,-10],"texture":[4],"doubleside":true,"bump":{"position":0,"size":5}},"coolhandguardthingfudgenamingstuff":{"offset":{"x":0,"y":-83,"z":0},"length":[95],"width":[50,15],"angle":[0],"position":[2,0],"texture":[63],"doubleside":true,"bump":{"position":15,"size":20}},"wi":{"offset":{"x":15,"y":75,"z":14},"length":[0,55],"width":[0,60,10],"angle":[80,80],"position":[0,0,40],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}},"ng":{"offset":{"x":0,"y":75,"z":14},"length":[0,55],"width":[0,60,10],"angle":[90,90],"position":[-10,-10,50],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}},"shield_top":{"offset":{"x":30,"y":110,"z":-10},"length":[30,45,40],"width":[40,100,90,40],"angle":[0,90,110],"position":[-30,0,0,0],"texture":[4,8,63],"doubleside":true,"bump":{"position":0,"size":11}},"shield_bot":{"offset":{"x":35,"y":80,"z":0},"length":[-10,25,40],"width":[0,100,90,40],"angle":[-90,-90,-110],"position":[0,0,0,0],"texture":[63,4,63],"doubleside":true,"bump":{"position":0,"size":11}}},"typespec":{"name":"Lancelot","level":7,"model":20,"code":720,"specs":{"shield":{"capacity":[400,400],"reload":[10,10]},"generator":{"capacity":[350,350],"reload":[500,500]},"ship":{"mass":540,"speed":[135,135],"rotation":[55,55],"acceleration":[85,85]}},"shape":[3.457,4.469,3.628,2.932,3.07,3.268,3.724,4.368,4.623,4.632,3.165,3.184,0.435,0.659,0.906,0.965,1.053,1.175,1.597,3.641,4.299,4.291,4.614,3.832,3.711,3.51,3.711,3.832,4.614,4.291,4.299,3.641,1.597,1.175,1.053,0.965,0.906,0.659,0.435,3.184,3.165,4.632,4.623,4.368,3.724,3.268,3.07,2.932,3.628,4.469],"lasers":[{"x":1.62,"y":-4.455,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-4.455,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-4.455,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-6.75,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-6.75,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-6.75,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-9.045,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-9.045,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-9.045,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-11.34,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-11.34,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-11.34,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-13.635,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-13.635,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-13.635,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-15.93,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-15.93,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-15.93,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-18.225,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-18.225,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-18.225,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-20.52,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-20.52,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-20.52,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-22.815,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-22.815,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.648,"y":-22.815,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.648,"y":-22.815,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.62,"y":-25.11,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.62,"y":-25.11,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-25.11,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.134,"y":-27.405,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.134,"y":-27.405,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.648,"y":-29.7,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.648,"y":-29.7,"z":0,"angle":-180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-31.995,"z":0,"angle":180,"damage":[9.722222222222221,9.722222222222221],"rate":1.4285714285714286,"type":1,"speed":[40,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.16,"z":0,"angle":0,"damage":[350,350],"rate":10,"type":2,"speed":[1,1],"number":20,"spread":0,"error":360,"recoil":0}],"radius":4.632}}'
        },
        name: "Justice",
        cooldown: 35 * 60,
        duration: 3 * 60,
        endOndeath: true,
        
        start: function (ship) {
            HelperFunctions.templates.start.call(this, ship);
            ship.set({generator: 500});
        },

        end: function (ship) {
            HelperFunctions.templates.end.call(this, ship);
            ship.set({generator: 350});
        }
    },
    // the 20s
    "BFG": {
        models: {
            default: '{"name":"BFG","level":6,"model":21,"size":4,"zoom":0.8,"specs":{"shield":{"capacity":[550,550],"reload":[6,6]},"generator":{"capacity":[2000,2000],"reload":[260,260]},"ship":{"mass":650,"speed":[45,45],"rotation":[18,18],"acceleration":[150,150]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-25,-30,-35,-25,-10,-15,-5,5,0,20,40,35,50,30],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,13,14,15,19,20,20,24,30,30,18,18,0],"height":[0,6,10,11,12,14,14,15,18,18,12,10,10,0],"propeller":false,"texture":[4,1,11,2,10,4]},"indicator":{"section_segments":12,"offset":{"x":0,"y":-25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-25,-30,-20,-5,0,15,20,40,50,125,100],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,13,13,8,8,15,15,10,10,0],"height":[0,10,13,13,9,9,9,9,10,10,0],"texture":[17,3,11,63,13,4,8,8,8,17],"angle":0,"propeller":1},"rialgun":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-22,"y":0,"z":0},"position":{"x":[13,10,9,8,10,9,6,3,3,0,0],"y":[-150,-120,-100,-80,-70,-50,-40,-10,30,70,50],"z":[-14,-10,-9,-8,-7,-5,0,0,0,0,0]},"width":[0,7,9,11,6,8,12,10,10,10,0],"height":[0,13,16,20,20,20,20,20,20,20,0],"texture":[3,3,18,4,13,4,3,8,10,17],"angle":0},"sides":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":30,"y":45,"z":0},"position":{"x":[0,-1,0,10,0,0],"y":[-80,-70,-40,-20,35,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,6,10,10,10,0],"height":[0,5,5,5,5,0],"propeller":false,"texture":[4,1,4,3,1,4]},"box3":{"vertical":true,"angle":30,"section_segments":[45,135,225,315],"offset":{"x":10,"y":0,"z":-50},"position":{"x":[0,0,0,0,0],"y":[0,10,19,20],"z":[0,0,0,0]},"width":[0,10,10,10],"height":[0,55,30,0],"texture":[4,63,8]},"intake":{"section_segments":8,"offset":{"x":30,"y":-10,"z":0},"position":{"x":[-10,-3,0,-1,1,0,0,0],"y":[15,35,35,60,70,100,90],"z":[5,5,0,0,0,0,0,0]},"width":[0,5,6,12,10,10,0],"height":[0,5,10,12,8,8,0],"texture":[63,1,4,1,18,17],"propeller":1}},"wings":{"cockpit":{"doubleside":true,"offset":{"x":0,"y":18,"z":10},"length":[10,5],"width":[25,20,10],"angle":[0,0],"position":[0,5,15],"texture":[17],"bump":{"position":10,"size":20}},"cockpit2":{"doubleside":true,"offset":{"x":0,"y":25,"z":14},"length":[10,5],"width":[25,20,10],"angle":[0,0],"position":[0,5,15],"texture":[5],"bump":{"position":10,"size":20}},"main":{"doubleside":true,"offset":{"x":0,"y":50,"z":13},"length":[15,20,25],"width":[60,40,20,10],"angle":[35,-20,7],"position":[0,10,30,20],"texture":[18,13,4,63],"bump":{"position":0,"size":13}},"rails":{"doubleside":true,"offset":{"x":8,"y":-55,"z":-5},"length":[4,20],"width":[200,180,20],"angle":[40,0],"position":[0,10,20],"texture":[17,13,63],"bump":{"position":20,"size":14}},"rails2":{"doubleside":true,"offset":{"x":42,"y":10,"z":-15},"length":[4,10],"width":[100,80,40],"angle":[40,0],"position":[0,10,20],"texture":[17,13,63],"bump":{"position":0,"size":14}},"shields":{"doubleside":true,"offset":{"x":20,"y":15,"z":-26},"length":[0,15,35,15],"width":[30,30,40,40,20,20],"angle":[30,30,80,150],"position":[10,10,0,0,10],"texture":[4,13,4,63],"bump":{"position":0,"size":4}},"shields2":{"doubleside":true,"offset":{"x":35,"y":65,"z":-26},"length":[0,15,25,15],"width":[30,30,40,40,20,20],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[4,13,4,63],"bump":{"position":0,"size":4}},"shields3":{"doubleside":true,"offset":{"x":17,"y":-80,"z":-21},"length":[0,15,25,16],"width":[30,30,40,40,20,20],"angle":[30,30,80,150],"position":[10,10,0,0,10],"texture":[4,13,4,63],"bump":{"position":0,"size":4}}},"typespec":{"name":"BFG","level":6,"model":21,"code":621,"specs":{"shield":{"capacity":[550,550],"reload":[6,6]},"generator":{"capacity":[2000,2000],"reload":[260,260]},"ship":{"mass":650,"speed":[45,45],"rotation":[18,18],"acceleration":[150,150]}},"shape":[12.417,11.928,8.764,8.458,6.545,4.528,4.64,4.612,4.28,4.052,3.934,3.999,4.133,4.35,4.545,4.732,5.016,5.445,5.95,7.011,7.483,7.809,7.879,7.57,8.04,8.016,8.04,7.57,7.879,7.809,7.483,7.011,5.95,5.445,5.016,4.732,4.545,4.35,4.133,3.999,3.934,4.052,4.28,4.612,4.64,4.528,6.545,8.458,8.764,11.928],"lasers":[],"radius":12.417}}',
            ability: '{"name":"BFG","level":1,"model":1,"size":4,"zoom":0.8,"specs":{"shield":{"capacity":[150,150],"reload":[10,10]},"generator":{"capacity":[15000,15000],"reload":[0.1,0.1]},"ship":{"mass":1500,"speed":[10,10],"rotation":[0.5,0.5],"acceleration":[300,300]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-25,-30,-35,-25,-10,-15,-5,5,0,20,40,35,50,30],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,13,14,15,19,20,20,24,30,30,18,18,0],"height":[0,6,10,11,12,14,14,15,18,18,12,10,10,0],"propeller":false,"texture":[4,1,11,2,10,4]},"indicator":{"section_segments":12,"offset":{"x":0,"y":-25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-25,-30,-20,-5,0,15,20,40,50,125,100],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,13,13,8,8,15,15,10,10,0],"height":[0,10,13,13,9,9,9,9,10,10,0],"texture":[17,17,18,63,17,4,8,8,8,17],"angle":0,"propeller":1},"rialgun":{"section_segments":[35,65,105,145,215,325],"offset":{"x":-62,"y":0,"z":0},"position":{"x":[13,10,9,8,10,9,6,3,3,0,0],"y":[-150,-120,-100,-80,-70,-50,-40,-10,30,70,50],"z":[-14,-10,-9,-8,-7,-5,0,0,0,0,0]},"width":[0,7,9,11,6,8,12,10,10,10,0],"height":[0,13,16,20,20,20,20,20,20,20,0],"texture":[3,3,18,4,13,4,3,8,10,17],"angle":-4},"sides":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":30,"y":45,"z":0},"position":{"x":[0,-1,0,10,0,0],"y":[-80,-70,-40,-20,35,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,6,10,10,10,0],"height":[0,5,5,5,5,0],"propeller":false,"texture":[4,1,4,3,1,4]},"box3":{"vertical":true,"angle":30,"section_segments":[45,135,225,315],"offset":{"x":10,"y":0,"z":-50},"position":{"x":[0,0,0,0,0],"y":[0,10,19,20],"z":[0,0,0,0]},"width":[0,10,10,10],"height":[0,55,30,0],"texture":[4,63,8]},"intake":{"section_segments":8,"offset":{"x":30,"y":-10,"z":0},"position":{"x":[-10,-3,0,-1,1,0,0,0],"y":[15,35,35,60,70,100,90],"z":[5,5,0,0,0,0,0,0]},"width":[0,5,6,12,10,10,0],"height":[0,5,10,12,8,8,0],"texture":[63,1,4,1,18,17],"propeller":1}},"wings":{"cockpit":{"doubleside":true,"offset":{"x":0,"y":14,"z":10},"length":[10,5],"width":[15,10,10],"angle":[0,0],"position":[0,5,15],"texture":[17],"bump":{"position":10,"size":20}},"cockpit2":{"doubleside":true,"offset":{"x":0,"y":25,"z":14},"length":[10,5],"width":[25,20,10],"angle":[0,0],"position":[0,5,15],"texture":[5],"bump":{"position":10,"size":20}},"main":{"doubleside":true,"offset":{"x":0,"y":50,"z":13},"length":[15,20,25],"width":[60,40,20,10],"angle":[35,-20,7],"position":[0,10,30,20],"texture":[18,13,4,63],"bump":{"position":0,"size":13}},"rails":{"doubleside":true,"offset":{"x":33,"y":-55,"z":-5},"length":[8,20],"width":[230,180,20],"angle":[40,0],"position":[0,10,20],"texture":[49,13,63],"bump":{"position":20,"size":5}},"rails15":{"doubleside":true,"offset":{"x":15,"y":0,"z":-5},"length":[3,25],"width":[160,140,20],"angle":[40,0],"position":[0,10,20],"texture":[49,5,63],"bump":{"position":20,"size":7}},"rails25":{"doubleside":true,"offset":{"x":22,"y":-20,"z":-5},"length":[5,15],"width":[200,180,20],"angle":[40,0],"position":[0,10,20],"texture":[49,4,63],"bump":{"position":20,"size":8}},"rails2":{"doubleside":true,"offset":{"x":45,"y":20,"z":-15},"length":[4,10],"width":[100,80,40],"angle":[40,0],"position":[0,10,20],"texture":[17,13,63],"bump":{"position":0,"size":14}},"shields":{"doubleside":true,"offset":{"x":40,"y":15,"z":-26},"length":[0,15,35,15],"width":[30,30,40,40,20,20],"angle":[30,30,80,150],"position":[10,10,0,0,10],"texture":[4,13,4,63],"bump":{"position":0,"size":4}},"shields2":{"doubleside":true,"offset":{"x":50,"y":65,"z":-26},"length":[0,15,25,15],"width":[30,30,40,40,20,20],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[4,13,4,63],"bump":{"position":0,"size":4}},"shields3":{"doubleside":true,"offset":{"x":40,"y":-80,"z":-21},"length":[0,15,25,16],"width":[30,30,40,40,20,20],"angle":[30,30,80,150],"position":[10,10,0,0,10],"texture":[4,13,4,63],"bump":{"position":0,"size":4}}},"typespec":{"name":"BFG","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[150,150],"reload":[10,10]},"generator":{"capacity":[15000,15000],"reload":[0.1,0.1]},"ship":{"mass":1500,"speed":[10,10],"rotation":[0.5,0.5],"acceleration":[300,300]}},"shape":[4.409,9.76,13.854,11.38,9.814,8.607,7.233,6.251,6.104,5.955,5.696,5.549,5.494,5.586,5.774,6.074,6.578,7.33,8.251,8.103,8.464,8.319,7.879,7.57,8.04,8.016,8.04,7.57,7.879,8.319,8.464,8.103,8.251,7.33,6.578,6.074,5.774,5.586,5.494,5.549,5.696,5.955,6.104,6.251,7.233,8.607,9.814,11.38,13.854,9.76],"lasers":[],"radius":13.854}}'
        },
        name: "Pulverize",
        duration: 5 * 60,
        cooldown: 35 * 60,
        tickInterval: 1,
        endOnDeath: true,

        velocityResetTick: 15,

        warningDuration: 1 * 60, // warning before ship can fire
        preAimDuration: 1.5 * 60, // delay before entering warning phase

        emissiveImg: `https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/BFG_warning_line.png`,

        imgScale: { // update this based on emissiveImg's resolution
            x: 3939,
            y: 400
        },

        scale: {
            x: 1.16 / 3939,
            y: 0.1
        },

        lasers: {
            default: {
                regen: 260,
                amount: 50, // amount of lasers
                speed: 25,
                damage: 40,
                rate: 2 / 15,
                range: { // laser range, in map unit
                    inner: 5,
                    outer: 160
                },
                includeLineModel: false // include the range line in ship model
            },
            ability: {
                amount: 0,
                range: {
                    inner: 5,
                    outer: 400
                },
                includeLineModel: true
            },
            rotationLocked: {
                regen: 0.1,
                amount: 60,
                speed: 20,
                damage: 500,
                rate: 1 / 150000
            }
        },

        indicatorLaser: {
            damage: ["damage x2"],
            rate: 10,
            type: 2,
            speed: [1,1],
            number: 100
        },

        laserSample: {
            x: 0,
            y: "-offset",
            z: 0,
            damage: ["damage x 2"],
            rate: "rate",
            type: 1,
            speed: ["speed x2"],
            number: 1,
            spread: 0,
            error: 0,
            recoil: 0,
            angle: 0
        },

        lineModel: {
            section_segments: 4,
            offset: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: [0,0],
                y: ["here",0],
                z: [0,0]
            },
            width: [2,2],
            height: [0,0],
            propeller: false,
            texture: [ 17 ]
        },

        delta: function (namespec) {
            let spec = this.lasers[namespec].range;
            return spec.outer - spec.inner;
        },

        start: function (ship) {
            ship.custom.abilityCustom.reloaded = false;
            ship.custom.abilityCustom.needsUpdate = false;
            ship.custom.abilityCustom.shield = ship.shield;
            ship.set({type: this.codes.ability, generator:0,invulnerable:100,vx:0,vy:0, stats: AbilityManager.maxStats});
        },

        tick: function (ship, duration) {
            if (duration >= this.preAimDuration - AbilityManager.updateDelay && !ship.custom.abilityCustom.needsUpdate) {
                ship.custom.abilityCustom.needsUpdate = true;
                AbilityManager.requestEntitiesInfoUpdate();
            }
            if (duration >= this.preAimDuration && !ship.custom.abilityCustom.reloaded) {
                if (ship.alive) {
                    ship.set({
                        type: this.codes.rotationLocked,
                        angle: ship.r * 180 / Math.PI,
                        stats: AbilityManager.maxStats,
                        vx: 0,
                        vy: 0
                    });
                    HelperFunctions.TimeManager.setTimeout(function () {
                        if (ship.alive && ship.custom.ability === this) ship.set({
                            generator: this.lasers.ability.amount * this.lasers.ability.damage
                        });
                    }.bind(this), this.warningDuration);
                    let delta = this.delta("ability");
                    let OBJCenterDistFromShip = delta / 2 + this.lasers.ability.range.inner;
                    let shipR = ship.r;
                    HelperFunctions.setPlaneOBJ({
                        id: "BFG_warning_" + ship.id,
                        scale: {
                            x: this.imgScale.x * this.scale.x * delta,
                            y: this.imgScale.y * this.scale.y
                        },
                        rotation: {
                            x: Math.PI,
                            y: 0,
                            z: -shipR
                        },
                        position: {
                            x: ship.x + OBJCenterDistFromShip * Math.cos(shipR),
                            y: ship.y + OBJCenterDistFromShip * Math.sin(shipR)
                        },
                        type: {
                            id: "BFG_warning_" + ship.team, 
                            emissive: this.emissiveImg,
                            emissiveColor: HelperFunctions.toHSLA(TeamManager.getDataFromShip(ship).hue)
                        }
                    });
                }
                ship.custom.abilityCustom.reloaded = true;
            }

            if (ship.custom.abilityCustom.reloaded && (duration - this.preAimDuration) % this.velocityResetTick == 0) ship.set({ vx: 0, vy: 0 });
        },
        end: function (ship) {
            ship.set({
                type: this.codes.default,
                stats: AbilityManager.maxStats,
                generator: this.lasers.default.damage * this.lasers.default.amount,
                shield: ship.custom.abilityCustom.shield || 150
            });
            HelperFunctions.removeObject("BFG_warning_" + ship.id);
        },

        compile: function (_this) {
            // setup proper spec for rotation-locked ver
            this.lasers.rotationLocked = {
                ...this.lasers.ability,
                ...this.lasers.rotationLocked
            }
            this.models.rotationLocked = this.models.ability;

            // process models
            for (let name in this.models) {
                let model = JSON.parse(this.models[name]), data = this.lasers[name], size = model.size;

                // adding laser model
                if (data.amount > 0) {
                    model.typespec.lasers = [
                        { // indicator laser
                            ...this.laserSample,
                            ...this.indicatorLaser,
                            y: -data.range.inner,
                            damage: Array(2).fill(data.damage * data.amount)
                        }
                    ];
                    let increment = this.delta(name) / data.amount;
                    for (let i = 0; i < data.amount; ++i) {
                        model.typespec.lasers.push({
                            ...this.laserSample,
                            y: -(increment * i + data.range.inner),
                            damage: Array(2).fill(data.damage),
                            speed: Array(2).fill(data.speed),
                            rate: data.rate
                        });
                    }
                }

                model.specs.generator = model.typespec.specs.generator = {
                    capacity: Array(2).fill((data.damage * data.amount) || 1e-300),
                    reload: Array(2).fill(data.regen || 1e-300)
                }

                // adding laser range indicator
                if (data.includeLineModel) {
                    let lineModel = HelperFunctions.clone(this.lineModel);
                    
                    lineModel.position.y[0] = -HelperFunctions.fromMapUnitToShipModelUnit(data.range.outer, size);

                    model.bodies["__LINE_BODY__"] = lineModel;
                }
                
                this.models[name] = JSON.stringify(model);
            };

            // clear agil on rotation-locked version
            let rotationLocked = JSON.parse(this.models.rotationLocked);

            for (let i of [rotationLocked, rotationLocked.typespec]) {
                i.specs.ship = {
                    mass: i.specs.ship.mass,
                    acceleration: [1e-300, 1e-300],
                    speed: [1e-300, 1e-300],
                    rotation: [1e-300, 1e-300]
                }
            }

            this.models.rotationLocked = JSON.stringify(rotationLocked);

            // revert
            this.lasers.ability = this.lasers.rotationLocked;
        }
    },
    "Puck": {
        models: {
            default: '{"name":"Puck","designer":"nex","level":6,"model":22,"size":1.65,"specs":{"shield":{"capacity":[250,250],"reload":[7,7]},"generator":{"capacity":[100,100],"reload":[45,45]},"ship":{"mass":220,"speed":[122,122],"rotation":[65,65],"acceleration":[120,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-70,-50,-25,0,30,50,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,12,15,20,15,25,22,20,20,0],"height":[0,4,6,7,10,7,14,11,10,10,0],"texture":[3,2,8,11,10,1,11,63,13,17],"propeller":true,"laser":{"damage":[100,100],"rate":10,"type":2,"speed":[666,666],"number":100,"error":666,"angle":666,"recoil":666}},"proper_ler":{"section_segments":8,"offset":{"x":15,"y":95,"z":-12},"position":{"x":[15,15,15,15,8,10,10,10,10,10],"y":[-120,-90,-105,-90,-75,-55,-40,-20,10,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,12,15,20,15,20,12,0],"height":[0,2,5,6,7,10,7,10,8,0],"texture":[1,18,3,4,2,4,4,11,17],"propeller":1,"laser":{"damage":[50,50],"rate":3,"type":1,"speed":[160,160],"number":1,"error":0,"angle":0,"recoil":75}},"y":{"section_segments":[0,175,-125],"offset":{"x":0,"y":15,"z":12},"position":{"x":[8,13,12,11,11,17],"y":[-66,-20,0,30,50,100],"z":[-9,-7.5,-2,-5,-5,0]},"width":[0,10.5,18.5,18.5,18.5,0],"height":[0,8,8,8,8,0],"texture":[3,63,63,2,4]},"n":{"section_segments":[0,125,-175],"offset":{"x":0,"y":15,"z":12},"position":{"x":[-8,-13,-12,-11,-11,-17],"y":[-66,-20,0,30,50,100],"z":[-9,-7.5,-2,-5,-5,0]},"width":[0,10.5,18.5,18.5,18.5,0],"height":[0,8,8,8,8,0],"texture":[3,63,63,2,4]},"eyes":{"section_segments":8,"offset":{"x":10,"y":-20,"z":8},"position":{"x":[0,0,5,3],"y":[-20,-13,8,25],"z":[0,0,0,0]},"width":[0,5,8,0],"height":[0,5,8,0],"propeller":false,"texture":[6,5,4]},"eyes2":{"section_segments":8,"offset":{"x":12,"y":15,"z":14},"position":{"x":[0,0,5,3],"y":[-20,-13,8,25],"z":[1,0,0,0]},"width":[0,5,8,0],"height":[0,5,8,0],"propeller":false,"texture":[6,5,4]}},"wings":{"main":{"offset":{"x":25,"y":55,"z":-12},"length":[40,20,15],"width":[60,45,30,20],"angle":[40,10,10],"position":[0,20,20,10],"texture":[8,14,4],"doubleside":true,"bump":{"position":0,"size":10}},"sides":{"offset":{"x":5,"y":15,"z":-10},"length":[10,15,20,15],"width":[0,120,80,50,40],"angle":[-30,-30,15,-15],"position":[-70,0,30,0,-40],"texture":[14,4,14,4],"doubleside":true,"bump":{"position":0,"size":7}},"winglets":{"offset":{"x":8,"y":-63,"z":-4},"length":[17,12],"width":[70,30,20],"angle":[10,20],"position":[0,20,10],"texture":[63,63],"doubleside":true,"bump":{"position":0,"size":10}},"w":{"offset":{"x":14,"y":40,"z":-2},"length":[30],"width":[100,25],"angle":[25],"position":[0,10],"texture":[14],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Puck","level":6,"model":22,"code":622,"specs":{"shield":{"capacity":[250,250],"reload":[7,7]},"generator":{"capacity":[100,100],"reload":[45,45]},"ship":{"mass":220,"speed":[122,122],"rotation":[65,65],"acceleration":[120,120]}},"shape":[3.465,3.34,2.701,2.279,2.395,2.214,1.861,2.487,2.464,2.273,2.144,2.059,2.01,1.938,1.881,1.852,1.882,3.674,3.869,3.873,3.864,3.735,3.674,3.643,3.836,3.141,3.836,3.643,3.674,3.735,3.864,3.873,3.869,3.674,1.882,1.852,1.881,1.938,2.01,2.059,2.144,2.273,2.464,2.487,1.861,2.214,2.395,2.279,2.701,3.34],"lasers":[{"x":0,"y":-3.465,"z":0,"angle":0,"damage":[100,100],"rate":10,"type":2,"speed":[666,666],"number":100,"spread":666,"error":666,"recoil":666},{"x":0.99,"y":-0.825,"z":-0.396,"angle":0,"damage":[50,50],"rate":3,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":75},{"x":-0.99,"y":-0.825,"z":-0.396,"angle":0,"damage":[50,50],"rate":3,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":75}],"radius":3.873}}',
            ability: '{"name":"Puck","designer":"nex","level":7,"model":22,"size":1.65,"specs":{"shield":{"capacity":[250,250],"reload":[7,7]},"generator":{"capacity":[100,100],"reload":[45,45]},"ship":{"mass":180,"speed":[122,122],"rotation":[65,65],"acceleration":[120,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-70,-50,-25,0,30,50,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,12,15,20,15,25,22,20,20,0],"height":[0,4,6,7,10,7,14,11,10,10,0],"texture":[3,2,8,11,10,1,11,63,13,17],"propeller":true,"laser":{"damage":[100,100],"rate":10,"type":2,"speed":[666,666],"number":100,"error":666,"angle":666,"recoil":666}},"proper_ler":{"section_segments":8,"offset":{"x":15,"y":95,"z":-12},"position":{"x":[15,15,15,15,8,10,10,10,10,10],"y":[-120,-90,-105,-90,-75,-55,-40,-20,10,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,12,15,20,15,20,12,0],"height":[0,2,5,6,7,10,7,10,8,0],"texture":[1,18,3,4,2,4,4,11,17],"propeller":1,"laser":{"damage":[50,50],"rate":3,"type":1,"speed":[160,160],"number":1,"error":0,"angle":0,"recoil":75}},"y":{"section_segments":[0,175,-125],"offset":{"x":0,"y":15,"z":12},"position":{"x":[8,13,12,11,11,17],"y":[-66,-20,0,30,50,100],"z":[-9,-7.5,-2,-5,-5,0]},"width":[0,10.5,18.5,18.5,18.5,0],"height":[0,8,8,8,8,0],"texture":[3,63,63,2,4]},"n":{"section_segments":[0,125,-175],"offset":{"x":0,"y":15,"z":12},"position":{"x":[-8,-13,-12,-11,-11,-17],"y":[-66,-20,0,30,50,100],"z":[-9,-7.5,-2,-5,-5,0]},"width":[0,10.5,18.5,18.5,18.5,0],"height":[0,8,8,8,8,0],"texture":[3,63,63,2,4]},"cockpi":{"section_segments":8,"offset":{"x":0,"y":2,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-45,-40,-20,5,25,41,30],"z":[-5,-5,-5,-2,-2,2,1]},"width":[0,9,14,14,16,10,0],"height":[0,7,10,9,9,6,0],"propeller":false,"texture":[4,9,9,13,4,4]}},"wings":{"main":{"offset":{"x":25,"y":55,"z":-12},"length":[40,20,15],"width":[60,45,30,20],"angle":[40,10,10],"position":[0,20,20,10],"texture":[8,14,4],"doubleside":true,"bump":{"position":0,"size":10}},"sides":{"offset":{"x":5,"y":15,"z":-10},"length":[10,15,20,15],"width":[0,120,80,50,40],"angle":[-30,-30,15,-15],"position":[-70,0,30,0,-40],"texture":[14,4,14,4],"doubleside":true,"bump":{"position":0,"size":7}},"winglets":{"offset":{"x":8,"y":-63,"z":-4},"length":[17,12],"width":[70,30,20],"angle":[10,20],"position":[0,20,10],"texture":[63,63],"doubleside":true,"bump":{"position":0,"size":10}},"w":{"offset":{"x":14,"y":40,"z":-2},"length":[30],"width":[100,25],"angle":[25],"position":[0,10],"texture":[14],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Puck","level":7,"model":22,"code":722,"specs":{"shield":{"capacity":[250,250],"reload":[7,7]},"generator":{"capacity":[100,100],"reload":[45,45]},"ship":{"mass":180,"speed":[122,122],"rotation":[65,65],"acceleration":[120,120]}},"shape":[3.465,3.34,2.701,2.279,2.395,2.214,1.861,2.487,2.464,2.273,2.144,2.059,2.01,1.938,1.881,1.852,1.882,3.674,3.869,3.873,3.864,3.735,3.674,3.643,3.836,3.141,3.836,3.643,3.674,3.735,3.864,3.873,3.869,3.674,1.882,1.852,1.881,1.938,2.01,2.059,2.144,2.273,2.464,2.487,1.861,2.214,2.395,2.279,2.701,3.34],"lasers":[{"x":0,"y":-3.465,"z":0,"angle":0,"damage":[100,100],"rate":10,"type":2,"speed":[666,666],"number":100,"spread":666,"error":666,"recoil":666},{"x":0.99,"y":-0.825,"z":-0.396,"angle":0,"damage":[50,50],"rate":3,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":75},{"x":-0.99,"y":-0.825,"z":-0.396,"angle":0,"damage":[50,50],"rate":3,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":75}],"radius":3.873}}'
        },
        name: "Mirror",
        range: 60,
        showAbilityRangeUI: true,
        includeRingOnModel: {
            default: true,
            ability: false
        },
        cooldown: 40 * 60,
        
        controlDuration: 25 * 60,

        cooldownRestartOnEnd: true,
        customEndcondition: true,

        puckedDuration: 12.5 * 60,

        abilityBlocker: {
            checker: function (ship) {
                return ship.custom.pucked != null
            },
            clear: function (ship) {
                HelperFunctions.TimeManager.clearTimeout(ship.custom.pucked);
                ship.custom.pucked = null;
            },
            reason: "Ship is being Pucked",
            abilityDisabledText: "PUCKED"
        },

        shipChangeBlocker: {
            checker: function (ship) {
                return ship.custom.abilityCustom != null && ship.custom.abilityCustom.puckTriggered != null;
            },
            clear: function (ship) {
                if (this.checker(ship)) ship.custom.abilityCustom.puckTriggered == null;
            },
            reason: "Ship is pucking other ships"
        },

        addPuck: function (player) {
            if (player.custom.inAbility) AbilityManager.end(player);
            player.set({type: this.codes.ability, stats: AbilityManager.maxStats});

            if (player.custom.pucked != null) HelperFunctions.TimeManager.clearTimeout(player.custom.pucked);
            
            player.custom.pucked = HelperFunctions.TimeManager.setTimeout(function () {
                this.removePuck(player);
            }.bind(this), this.puckedDuration);
        },

        removePuck: function (player) {
            if (player.custom.pucked != null) {
                this.abilityBlocker.clear(player);
                let abil = player.custom.ability;
                if (abil != null) {
                    player.set({
                        type: abil.getDefaultShipCode(player),
                        stats: AbilityManager.maxStats
                    });
                }
            }
        },

        endPuckPhase: function (ship) {
            // When a puck's mirror duration is over:
            // - if the puck reaches that team's limit --> do nothing (means that they will keep that ship forever until they changes on spawn)
            // - otherwise, if the ship can't be assigned by other reasons (excluding in ability), just fake-assign back the model and ability
            // - otherwise re-assign the Puck template to the ship (this means resetting as well)
            ship.custom.abilityCustom.puckTriggered = null;
            let res = AbilityManager.assign(ship, this.shipName, true, { ability: true });
            if (res.success) AbilityManager.assign(ship, this.shipName, false, true);
            else if (res.code != AbilityManager.assignStatus.limitExceeded.code) AbilityManager.assign(ship, this.shipName, false, true, { blocker: true });
        },

        requirementsText: function (ship) {
            return HelperFunctions.templates.requirementsText.call(this, ship);
        },

        start: function (ship) {
            // ABILITY THEORY
            // Puck will only choose ships within the range and that ship doesn't exceed the ship limit of the puck's team
            // 
            // Puck will prioritize ship to puck based on this order:
            // - Non-puck ship
            // - Puck or a pucked ship
            // 
            // When the victim has been selected, this ability will
            // 1. Puck the victim
            // 2. If the victim
            //   - is a puck or is still being pucked --> Puck the user as well
            //   - otherwise --> Assign victim's ship to puck and add puck timeout (to swap back to old ship)
            // 3. If there are no such victims found --> ends the ability and do nothing
            // 
            // The puck then can instantly use the ability,
            // and after that ability ends, they can still use that ship or retrigger its ability
            // (if the puck duration isn't over yet)

            let shipsList = AbilityManager.getAssignableShipsList(ship);
            let players = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true }).filter(s => shipsList.includes(s.custom.shipName));
            let puckVictim = null;
            for (let player of players) {
                if (player.custom.ability === this || this.abilityBlocker.checker(player)) {
                    puckVictim = player;
                    continue;
                }

                AbilityManager.assign(ship, player.custom.shipName, false, true);
                AbilityManager.reload(ship);

                ship.custom.abilityCustom.puckTriggered = game.step;

                this.addPuck(player);
                return;
            }
            
            if (puckVictim == null) ship.custom.forceEnd = true;
            else {
                this.addPuck(ship);
                this.addPuck(puckVictim);
            }
        },

        globalEvent: function (event) {
            let ship;
            if (event.name == "ship_destroyed" && (ship = event.ship) != null) {
                this.removePuck(ship);
                if (this.shipChangeBlocker.checker(ship)) this.endPuckPhase(ship);
            }
        },

        globalTick: function (game) {
            for (let ship of game.ships) {
                if (ship != null && ship.id != null && this.shipChangeBlocker.checker(ship) && game.step - ship.custom.abilityCustom.puckTriggered > this.controlDuration) {
                    this.endPuckPhase(ship);
                }
            }
        }
    },
    "Sigma": {
        models: {
          default: '{"name":"Sigma","level":6,"model":23,"size":1.88,"specs":{"shield":{"capacity":[220,320],"reload":[6,9]},"generator":{"capacity":[220,300],"reload":[45,45]},"ship":{"mass":299,"speed":[108,108],"rotation":[65,65],"acceleration":[50,118]}},"bodies":{"barrel":{"section_segments":12,"offset":{"x":0,"y":-60,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-50,-50,-20,-10,45,50],"z":[0,0,0,0,0,0]},"width":[0,12,12,12,12,0],"height":[0,12,12,12,12,0],"texture":[4,13,4,8,10,1],"angle":0},"main":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-60,-15,0,50,70,60],"z":[0,0,0,0,0,0,0,0]},"width":[0,32,35,45,30,22,0],"height":[0,10,15,15,15,15,0],"texture":[4,4,63,4,3,17],"propeller":true},"main2":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":20,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-75,-75,-20,10,30,45,60,70],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,25,30,30,25,20,0],"height":[0,8,10,10,10,10,10,0],"texture":[3,4,3,13,3,4,4]},"main3":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":20,"z":18},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,-10,0,20,50,60,70],"z":[0,0,0,0,0,-1,0,-5,-5]},"width":[0,10,10,10,10,8,5,0],"height":[0,15,15,15,15,15,5,0],"texture":[4]},"sus_engine":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":4,"y":20,"z":19},"position":{"x":[0,0,0,0,0],"y":[-60,-40,-20,0,40],"z":[0,0,0,0,0]},"width":[0,12,15,14,0],"height":[0,8,10,10,0],"texture":[7,9.15,9.15,4],"angle":0},"harry_potter_and_the_chamber_of_secrets":{"section_segments":12,"offset":{"x":0,"y":-15,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-15,-10,0,45,50],"z":[-2,-2,-2,0,0,0]},"width":[0,8,9,9,10,10,0],"height":[0,9,9,9,10,10,0],"texture":[4,10,63,3,2,1],"angle":0},"brake":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":0,"y":-150,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[35,35,10,10,25,40,40],"z":[0,0,0,0,0,0,0,0]},"width":[5,12,12,22,22,12,10],"height":[5,7,7,12,12,12,10],"propeller":false,"texture":[6,6,1,4,3,17],"laser":{"damage":[8,10],"rate":4,"type":1,"speed":[175,205],"number":6,"error":12,"angle":0,"recoil":15}},"barrelrings":{"vertical":1,"section_segments":8,"offset":{"x":8,"y":0,"z":50},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[20,20,15,15,20],"height":[25,25,20,20,25],"texture":[63]},"barrelrings3":{"section_segments":8,"offset":{"x":0,"y":-108,"z":0},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[15,15,10,10,15],"height":[14,14,10,10,14],"texture":[63]},"thrust":{"section_segments":10,"offset":{"x":25,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,12,0],"height":[0,8,12,12,12,8,8,12,5,0],"texture":[6,4,10,3,4,3,2],"propeller":true}},"wings":{"shields":{"doubleside":true,"offset":{"x":0,"y":-60,"z":-15},"length":[0,10,10,15,10],"width":[60,60,65,65,60,60,60],"angle":[90,10,60,90,150],"position":[0,0,0,0,0,0],"texture":[63],"bump":{"position":0,"size":5}},"wings1":{"doubleside":true,"offset":{"x":35,"y":60,"z":0},"length":[-10,-10,-30],"width":[50,50,100,30],"angle":[210,315,315],"position":[0,0,-50,0],"texture":[4,3,63],"bump":{"position":10,"size":-5}},"main":{"length":[40,20,15],"width":[100,50,40,30],"angle":[-25,20,25],"position":[30,80,70,45],"bump":{"position":-20,"size":10},"offset":{"x":0,"y":-25,"z":0},"texture":[11,11,63],"doubleside":true}},"typespec":{"name":"Sigma","level":6,"model":23,"code":623,"specs":{"shield":{"capacity":[220,320],"reload":[6,9]},"generator":{"capacity":[220,300],"reload":[45,45]},"ship":{"mass":299,"speed":[108,108],"rotation":[65,65],"acceleration":[50,118]}},"shape":[5.274,5.307,3.168,2.677,2.307,1.798,2.038,1.911,1.752,1.638,1.572,1.529,1.517,2.601,2.664,2.772,2.902,2.954,3.054,3.203,3.219,3.593,3.531,3.451,3.445,3.39,3.445,3.451,3.531,3.593,3.219,3.203,3.054,2.954,2.902,2.772,2.664,2.601,1.517,1.529,1.572,1.638,1.752,1.911,2.038,1.798,2.307,2.677,3.168,5.307],"lasers":[{"x":0,"y":-5.264,"z":0,"angle":0,"damage":[8,10],"rate":4,"type":1,"speed":[175,205],"number":6,"spread":0,"error":12,"recoil":15}],"radius":5.307}}'
        },
        name: "Aura",
        cooldown: 35 * 60,
        duration: 8 * 60,
        endOnDeath: true,

        cooldownRestartOnEnd: true,

        start: function (ship) {
            ship.set({collider:false,invulnerable:150});
        },

        end: function (ship) {
            ship.set({collider:true});
            if (ship.custom.ability === this) ship.set({invulnerable:150});
        }
    },
    "Anomaly": {
        hidden: GAME_OPTIONS.teams_count < 2, // why bother using this ship on one-or-zero-team game?
        models: {
            default: '{"name":"Anomaly","designer":"nex","level":6,"model":24,"size":1.136,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[300,300],"reload":[48,48]},"ship":{"mass":255,"speed":[110,130],"rotation":[50,60],"acceleration":[100,120]}},"bodies":{"main_INDICATOR":{"section_segments":8,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-85,-65,-42.5,-25,0,30,45,60,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,11,13,15,11,12,18,20,15,24,22,22,0],"height":[0,7,9,11,8,9,14,15,10,17,16,12,0],"texture":[3,2,10,3,4,10,10,3,3,13,4,17],"propeller":true,"laser":{"damage":[15,15],"rate":5,"type":1,"speed":[155,155],"number":5,"error":0,"angle":0,"recoil":0}},"thrusters":{"section_segments":8,"offset":{"x":30,"y":15,"z":-25},"position":{"x":[-10,-10,-10,-10,-10,0,0,0,0,0],"y":[-100,-95,-80,-50,-20,10,40,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,8,15,16,20,16,22,22,22,0],"height":[0,5,9,14,16,14,18,18,17,0],"texture":[4,3,10,63,63,4,15,8,17],"propeller":true,"angle":0},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":5},"position":{"x":[0,0,0,0,0],"y":[-75,-55,-35,-10,15],"z":[0,0,0,1,2]},"width":[0,10,13,18,0],"height":[0,8,13,13,0],"texture":[4,9,9,4],"propeller":false}},"wings":{"main":{"offset":{"x":4,"y":-65,"z":0},"length":[30,20,20,35],"width":[90,90,60,90,30],"angle":[-10,-10,-15,-15],"position":[0,80,115,140,225],"texture":[8,4,18,4],"doubleside":true,"bump":{"position":20,"size":7}},"notmain":{"offset":{"x":6.5,"y":36,"z":-5},"length":[30,15,30],"width":[110,40,70,30],"angle":[30,30,40],"position":[0,40,60,110],"texture":[8,1,63],"doubleside":true,"bump":{"position":20,"size":8}},"anunreasonableamountofwings":{"offset":{"x":-5,"y":-2,"z":-9},"length":[23,12.5,25],"width":[20,50,60,20],"angle":[30,60,125],"position":[-50,-10,20,30],"texture":[1,2,63],"doubleside":true,"bump":{"position":0,"size":8}},"vanish":{"offset":{"x":17,"y":-95,"z":-4},"length":[-10,27.5],"width":[20,80,0],"angle":[-20,-20],"position":[0,0,30],"texture":[13,63],"doubleside":true,"bump":{"position":30,"size":20}},"winglets":{"offset":{"x":0,"y":65,"z":17},"length":[40],"width":[40,20],"angle":[20],"position":[0,20],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}},"wingletswingletswinglets":{"offset":{"x":5,"y":4,"z":5},"length":[50],"width":[50,15],"angle":[0],"position":[0,25],"texture":[3],"doubleside":true,"bump":{"position":0,"size":10}},"wingletswingletswingletswingletswingletswinglets":{"offset":{"x":5,"y":-10,"z":-2},"length":[53.57142857142858],"width":[70,20],"angle":[-20],"position":[-69,-10],"texture":[3.475],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Anomaly","level":6,"model":24,"code":624,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[300,300],"reload":[48,48]},"ship":{"mass":255,"speed":[110,130],"rotation":[50,60],"acceleration":[100,120]}},"shape":[3.072,3.025,2.363,1.972,1.749,1.599,1.512,1.459,1.434,1.43,1.351,1.298,1.026,1.093,1.177,1.513,1.966,2.274,2.725,3.503,4.508,4.653,3.975,2.747,2.66,1.967,2.66,2.747,3.975,4.653,4.508,3.503,2.725,2.274,1.966,1.513,1.177,1.093,1.031,1.298,1.351,1.43,1.434,1.459,1.512,1.599,1.749,1.972,2.363,3.025],"lasers":[{"x":0,"y":-2.613,"z":0,"angle":0,"damage":[15,15],"rate":5,"type":1,"speed":[155,155],"number":5,"spread":0,"error":0,"recoil":0}],"radius":4.653}}',
            ability: '{"name":"Anomaly","designer":"nex","level":6,"model":24,"size":1.136,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[250,250],"reload":[48,48]},"ship":{"mass":255,"speed":[110,130],"rotation":[50,60],"acceleration":[100,120]}},"bodies":{"main_INDICATOR":{"section_segments":8,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-85,-65,-42.5,-25,0,30,45,60,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,11,13,15,11,12,18,20,15,24,22,22,0],"height":[0,7,9,11,8,9,14,15,10,17,16,12,0],"texture":[3,2,10,3,4,10,10,3,3,13,4,17],"propeller":true,"laser":{"damage":[10,10],"rate":5,"type":1,"speed":[155,155],"number":5,"error":0,"angle":0,"recoil":0}},"thrusters":{"section_segments":8,"offset":{"x":30,"y":15,"z":-25},"position":{"x":[-10,-10,-10,-10,-10,0,0,0,0,0],"y":[-100,-95,-80,-50,-20,10,40,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,8,15,16,20,16,22,22,22,0],"height":[0,5,9,14,16,14,18,18,17,0],"texture":[4,3,10,63,63,4,15,8,17],"propeller":true,"angle":0},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":5},"position":{"x":[0,0,0,0,0],"y":[-75,-55,-35,-10,15],"z":[0,0,0,1,2]},"width":[0,10,13,18,0],"height":[0,8,13,13,0],"texture":[4,9,9,4],"propeller":false}},"wings":{"main":{"offset":{"x":4,"y":-65,"z":0},"length":[30,20,20,35],"width":[90,90,60,90,30],"angle":[-10,-10,-15,-15],"position":[0,80,115,140,225],"texture":[8,4,18,4],"doubleside":true,"bump":{"position":20,"size":7}},"notmain":{"offset":{"x":6.5,"y":36,"z":-5},"length":[30,15,30],"width":[110,40,70,30],"angle":[30,30,40],"position":[0,40,60,110],"texture":[8,1,63],"doubleside":true,"bump":{"position":20,"size":8}},"anunreasonableamountofwings":{"offset":{"x":-5,"y":-2,"z":-9},"length":[23,12.5,25],"width":[20,50,60,20],"angle":[30,60,125],"position":[-50,-10,20,30],"texture":[1,2,63],"doubleside":true,"bump":{"position":0,"size":8}},"vanish":{"offset":{"x":17,"y":-95,"z":-4},"length":[-10,27.5],"width":[20,80,0],"angle":[-20,-20],"position":[0,0,30],"texture":[13,63],"doubleside":true,"bump":{"position":30,"size":20}},"winglets":{"offset":{"x":0,"y":65,"z":17},"length":[40],"width":[40,20],"angle":[20],"position":[0,20],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}},"wingletswingletswinglets":{"offset":{"x":5,"y":4,"z":5},"length":[50],"width":[50,15],"angle":[0],"position":[0,25],"texture":[3],"doubleside":true,"bump":{"position":0,"size":10}},"wingletswingletswingletswingletswingletswinglets":{"offset":{"x":5,"y":-10,"z":-2},"length":[53.57142857142858],"width":[70,20],"angle":[-20],"position":[-69,-10],"texture":[3.475],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Anomaly","level":6,"model":24,"code":624,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[250,250],"reload":[48,48]},"ship":{"mass":255,"speed":[110,130],"rotation":[50,60],"acceleration":[100,120]}},"shape":[3.072,3.025,2.363,1.972,1.749,1.599,1.512,1.459,1.434,1.43,1.351,1.298,1.026,1.093,1.177,1.513,1.966,2.274,2.725,3.503,4.508,4.653,3.975,2.747,2.66,1.967,2.66,2.747,3.975,4.653,4.508,3.503,2.725,2.274,1.966,1.513,1.177,1.093,1.031,1.298,1.351,1.43,1.434,1.459,1.512,1.599,1.749,1.972,2.363,3.025],"lasers":[{"x":0,"y":-2.613,"z":0,"angle":0,"damage":[10,10],"rate":5,"type":1,"speed":[155,155],"number":5,"spread":0,"error":0,"recoil":0}],"radius":4.653}}'
        },
        name: "Spy",
        duration: 10 * 60,
        cooldown: 20 * 60,
        endOndeath: true,

        cooldownRestartOnEnd: true,

        start: function (ship) {
            let teams = [...TeamManager.getAll()], curTeam = TeamManager.getDataFromShip(ship), team = curTeam;
            while (team == curTeam) team = HelperFunctions.randomItem(teams, true).value;
            TeamManager.set(ship, team.id, false, false);
            ship.set({ type: this.codes.ability, stats: AbilityManager.maxStats });
        },
        end: function (ship) {
            TeamManager.set(ship, void 0, false, false);
            ship.set({ type: this.codes.default, stats: AbilityManager.maxStats });
        }
    },
    "Guren": {
        models: {
            default: '{"name":"Guren","designer":"nex","level":6,"model":25,"size":2,"specs":{"shield":{"capacity":[270,270],"reload":[8,8]},"generator":{"capacity":[150,150],"reload":[50,50]},"ship":{"mass":350,"speed":[78,85],"rotation":[50,54],"acceleration":[90,117]}},"bodies":{"RWS":{"section_segments":8,"offset":{"x":0,"y":-65,"z":-5},"position":{"x":[0,0,0,0,0],"y":[0,-10,0,12,62.5],"z":[0,0,0,2,8]},"width":[0,15,17,20,0],"height":[0,10,12,15,0],"texture":[18,12,11,11],"propeller":false},"cannon1":{"section_segments":6,"angle":1,"offset":{"x":15,"y":-115,"z":-13},"position":{"x":[0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,3],"height":[0,1,3],"texture":[17,4],"laser":{"damage":[10,25],"rate":1.5,"type":1,"speed":[220,220],"number":1}},"cannon2":{"section_segments":6,"angle":1,"offset":{"x":31,"y":-130,"z":0},"position":{"x":[0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,3],"height":[0,1,3],"texture":[17,4],"laser":{"damage":[10,18],"rate":5,"type":1,"speed":[220,220],"number":1}},"cannon3":{"section_segments":6,"angle":0,"offset":{"x":0,"y":-155,"z":10},"position":{"x":[0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,4],"height":[0,1,4],"texture":[17,4],"laser":{"damage":[50,50],"rate":1.5,"type":1,"speed":[190,190],"number":1}},"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-55,-60,-50,-30,-15,-5,10,30,45,70,65,60],"z":[-10,-10,-10,-10,-10,-10,-5,0,1,0,0,0]},"width":[0,10,15,18.5,20,20,15,15,20,18,9,0],"height":[0,5,7,8,10,10,7,7,10,8,4,0],"texture":[4,2,2,2,4,63,4,63,12,17],"propeller":true,"laser":{"damage":[150,150],"rate":1,"type":2,"speed":[1,1],"number":100}},"yoinky":{"section_segments":[0,125,-175],"offset":{"x":0,"y":5,"z":8},"position":{"x":[-12,-12,-9,-13,-19],"y":[-35,-40,-15,20,50],"z":[-7,-6,-3,-3,-7.4]},"width":[0,10,18,20,0],"height":[0,6,8,8,0],"texture":[3.9,3.9,10,3.9]},"sploinky":{"section_segments":[0,175,-125],"offset":{"x":0,"y":5,"z":8},"position":{"x":[12,12,9,13,19],"y":[-35,-40,-15,20,50],"z":[-7,-6,-3,-3,-7.4]},"width":[0,10,18,20,0],"height":[0,6,8,8,0],"texture":[4.1,4.1,10,4.1]},"cockpit_extra":{"section_segments":3,"offset":{"x":0,"y":-9,"z":12},"position":{"x":[-20,0,5,0,-20,0,0],"y":[-20,-10,0,10,20],"z":[-6,-2,-1,-2,-6,0,0]},"width":[0,14,16,14,0],"height":[0,6,6,6,0],"texture":[8.6],"angle":90},"side_properulerusorgporeugepjvdkmcxzAAAAAAAAAAAAAAAAAAAnrus_zxc":{"section_segments":8,"offset":{"x":40,"y":40,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-25,-10,10,25,35,50,80,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,17,20,12,12,20,16,0],"height":[0,12,17,20,12,12,20,16,0],"texture":[4,3,4,13,4,13,10,17],"propeller":true,"angle":0},"not_side_propulsor":{"section_segments":8,"offset":{"x":0,"y":45,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-25,-10,10,25,35,50,80,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,17,17,12,12,20,16,0],"height":[0,12,17,17,12,12,20,16,0],"texture":[4,63,1,13,4,13,10,17],"propeller":true,"angle":0}},"wings":{"cockpit_cover":{"offset":{"x":0,"y":11,"z":17},"length":[10,9],"width":[50,50,0],"angle":[-5,-40],"position":[-1,4,-8],"texture":[4,9],"doubleside":true,"bump":{"position":30,"size":10}},"main":{"offset":{"x":-3,"y":26,"z":0},"length":[35,25,37.5],"width":[45,40,35,20],"angle":[40,-5,-30],"position":[0,0,30,30],"texture":[11,63,8],"doubleside":true,"bump":{"position":0,"size":10}},"unnecessary_wing":{"offset":{"x":5,"y":70,"z":20},"length":[20,40],"width":[40,30,10],"angle":[-5,-10],"position":[0,20,30],"texture":[2,4],"doubleside":true,"bump":{"position":0,"size":10}},"another_unnecessary_wing":{"offset":{"x":7,"y":-50,"z":0},"length":[20,30],"width":[40,30,10],"angle":[15,30],"position":[0,20,30],"texture":[8,63],"doubleside":true,"bump":{"position":0,"size":10}},"claw_C":{"offset":{"x":-6,"y":-75,"z":10},"length":[0,6,6],"width":[0,40,130,40],"angle":[0,0,0],"position":[0,0,-20,0],"texture":115,"doubleside":true,"bump":{"position":0,"size":10}},"claws_BD":{"offset":{"x":10,"y":-65,"z":-10},"length":[0,6,6],"width":[0,20,80,20],"angle":[-25,-25,-25],"position":[0,0,-10,0],"texture":115,"doubleside":true,"bump":{"position":0,"size":10}},"claws_AE":{"offset":{"x":25,"y":-50,"z":1},"length":[0,6,6],"width":[0,40,120,40],"angle":[-10,-10,-10],"position":[0,0,-25,0],"texture":115,"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Guren","level":6,"model":25,"code":625,"specs":{"shield":{"capacity":[270,270],"reload":[8,8]},"generator":{"capacity":[150,150],"reload":[50,50]},"ship":{"mass":350,"speed":[78,85],"rotation":[50,54],"acceleration":[90,117]}},"shape":[6.6,5.035,5.734,4.366,3.386,2.748,2.307,2.154,2.257,2.319,2.25,1.005,1.013,1.04,1.721,2.326,2.61,4.01,4.185,3.974,4.8,5.266,5.297,5.047,5.041,5.01,5.041,5.047,5.297,5.266,4.8,3.974,4.185,4.01,2.61,2.326,1.721,1.04,1.013,1.005,2.25,2.319,2.257,2.154,2.307,2.748,3.386,4.366,5.734,5.035],"lasers":[{"x":0.593,"y":-5,"z":-0.52,"angle":1,"damage":[10,25],"rate":1.5,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.593,"y":-5,"z":-0.52,"angle":-1,"damage":[10,25],"rate":1.5,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.233,"y":-5.6,"z":0,"angle":1,"damage":[10,18],"rate":5,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.233,"y":-5.6,"z":0,"angle":-1,"damage":[10,18],"rate":5,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-6.6,"z":0.4,"angle":0,"damage":[50,50],"rate":1.5,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.4,"z":0.4,"angle":0,"damage":[150,150],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":6.6}}',
            ability: '{"name":"Guren","designer":"nex","level":7,"model":25,"size":1.9,"specs":{"shield":{"capacity":[350,350],"reload":[16,16]},"generator":{"capacity":[500,500],"reload":[5000,5000]},"ship":{"mass":850,"speed":[25,25],"rotation":[22,22],"acceleration":[112,112]}},"bodies":{"RWS":{"section_segments":0,"offset":{"x":0,"y":-160,"z":-5},"position":{"x":[0,0],"y":[0,-10],"z":[0,0]},"width":[0,15],"height":[0,15],"texture":[18,12],"propeller":false,"laser":{"damage":[30,30],"speed":[60,60],"rate":6,"type":1,"number":1,"recoil":0,"error":75}},"RWS2":{"section_segments":0,"offset":{"x":0,"y":-170,"z":-5},"position":{"x":[0,0],"y":[0,-10],"z":[0,0]},"width":[0,15],"height":[0,15],"texture":[18,12],"propeller":false,"laser":{"damage":[50,50],"speed":[60,60],"rate":5,"type":1,"number":1,"error":180}},"RWS3":{"section_segments":0,"offset":{"x":0,"y":-180,"z":-5},"position":{"x":[0,0],"y":[0,-10],"z":[0,0]},"width":[0,15],"height":[0,15],"texture":[18,12],"propeller":false,"laser":{"damage":[6,6],"speed":[250,250],"rate":10,"type":1,"number":10,"error":360}},"RWs4":{"section_segments":8,"offset":{"x":0,"y":-65,"z":-5},"position":{"x":[0,0,0,0,0],"y":[0,-10,0,12,62.5],"z":[0,0,0,2,8]},"width":[0,15,17,20,0],"height":[0,10,12,15,0],"texture":[18,12,11,11],"propeller":false,"laser":{"damage":[100,100],"speed":[60,60],"rate":5,"type":1,"number":1,"error":120}},"cannon1":{"section_segments":6,"angle":1,"offset":{"x":20,"y":-105,"z":-13},"position":{"x":[0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,3],"height":[0,1,3],"texture":[17,4]},"cannon2":{"section_segments":6,"angle":1,"offset":{"x":41,"y":-120,"z":0},"position":{"x":[0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,3],"height":[0,1,3],"texture":[17,4]},"cannon3":{"section_segments":6,"angle":1,"offset":{"x":0,"y":-145,"z":10},"position":{"x":[0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,4],"height":[0,1,4],"texture":[17,4]},"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-55,-60,-50,-30,-15,-5,10,30,45,70,65,60],"z":[-10,-10,-10,-10,-10,-10,-5,0,1,0,0,0]},"width":[0,10,15,18.5,20,20,15,15,20,18,9,0],"height":[0,5,7,8,10,10,7,7,10,8,4,0],"texture":[4,2,2,2,4,63,4,63,12,17],"propeller":true},"yoinky":{"section_segments":[0,125,-175],"offset":{"x":0,"y":5,"z":8},"position":{"x":[-12,-12,-9,-13,-19],"y":[-35,-40,-15,20,50],"z":[-7,-6,-3,-3,-7.4]},"width":[0,10,18,20,0],"height":[0,6,8,8,0],"texture":[3.9,3.9,10,3.9]},"sploinky":{"section_segments":[0,175,-125],"offset":{"x":0,"y":5,"z":8},"position":{"x":[12,12,9,13,19],"y":[-35,-40,-15,20,50],"z":[-7,-6,-3,-3,-7.4]},"width":[0,10,18,20,0],"height":[0,6,8,8,0],"texture":[4.1,4.1,10,4.1]},"cockpit_extra":{"section_segments":3,"offset":{"x":0,"y":-9,"z":12},"position":{"x":[-20,0,5,0,-20,0,0],"y":[-20,-10,0,10,20],"z":[-6,-2,-1,-2,-6,0,0]},"width":[0,14,16,14,0],"height":[0,6,6,6,0],"texture":[17],"angle":90},"side_properulerusorgporeugepjvdkmcxzAAAAAAAAAAAAAAAAAAAnrus_zxc":{"section_segments":8,"offset":{"x":40,"y":40,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-25,-10,10,25,35,50,80,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,17,20,12,12,20,16,0],"height":[0,12,17,20,12,12,20,16,0],"texture":[4,3,4,13,4,13,10,17],"propeller":true,"angle":0},"not_side_propulsor":{"section_segments":8,"offset":{"x":0,"y":45,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-25,-10,10,25,35,50,80,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,17,17,12,12,20,16,0],"height":[0,12,17,17,12,12,20,16,0],"texture":[4,63,1,13,4,13,10,17],"propeller":true,"angle":0}},"wings":{"cockpit_cover":{"offset":{"x":0,"y":11,"z":17},"length":[10,9],"width":[50,50,0],"angle":[-5,-40],"position":[-1,4,-8],"texture":[4,5],"doubleside":true,"bump":{"position":30,"size":10}},"main":{"offset":{"x":-3,"y":26,"z":0},"length":[35,25,37.5],"width":[45,40,35,20],"angle":[40,-5,-30],"position":[0,0,30,30],"texture":[11,63,8],"doubleside":true,"bump":{"position":0,"size":10}},"unnecessary_wing":{"offset":{"x":5,"y":70,"z":20},"length":[20,40],"width":[40,30,10],"angle":[-5,-10],"position":[0,20,30],"texture":[2,4],"doubleside":true,"bump":{"position":0,"size":10}},"another_unnecessary_wing":{"offset":{"x":7,"y":-50,"z":0},"length":[20,30],"width":[40,30,10],"angle":[15,30],"position":[0,20,30],"texture":[8,63],"doubleside":true,"bump":{"position":0,"size":10}},"claw_C":{"offset":{"x":-6,"y":-65,"z":10},"length":[0,6,6],"width":[0,40,130,40],"angle":[0,0,0],"position":[0,0,-20,0],"texture":115,"doubleside":true,"bump":{"position":0,"size":10}},"claws_BD":{"offset":{"x":15,"y":-55,"z":-10},"length":[0,6,6],"width":[0,20,80,20],"angle":[-25,-25,-25],"position":[0,0,-10,0],"texture":115,"doubleside":true,"bump":{"position":0,"size":10}},"claws_AE":{"offset":{"x":35,"y":-40,"z":1},"length":[0,6,6],"width":[0,40,120,40],"angle":[-10,-10,-10],"position":[0,0,-25,0],"texture":115,"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Guren","level":7,"model":25,"code":725,"specs":{"shield":{"capacity":[350,350],"reload":[16,16]},"generator":{"capacity":[500,500],"reload":[5000,5000]},"ship":{"mass":850,"speed":[25,25],"rotation":[22,22],"acceleration":[112,112]}},"shape":[5.89,4.434,5.178,5.083,3.89,3.232,2.785,2.431,2.199,2.203,2.137,1.697,1.569,0.988,1.635,2.209,2.48,3.809,3.976,3.776,4.56,5.003,5.032,4.795,4.789,4.759,4.789,4.795,5.032,5.003,4.56,3.776,3.976,3.809,2.48,2.209,1.635,0.988,1.569,1.697,2.137,2.203,2.199,2.431,2.785,3.232,3.89,5.083,5.178,4.434],"lasers":[{"x":0,"y":-6.46,"z":-0.19,"angle":0,"damage":[30,30],"rate":6,"type":1,"speed":[60,60],"number":1,"spread":0,"error":75,"recoil":0},{"x":0,"y":-6.84,"z":-0.19,"angle":0,"damage":[50,50],"rate":5,"type":1,"speed":[60,60],"number":1,"spread":0,"error":180,"recoil":0},{"x":0,"y":-7.22,"z":-0.19,"angle":0,"damage":[6,6],"rate":10,"type":1,"speed":[250,250],"number":10,"spread":0,"error":360,"recoil":0},{"x":0,"y":-2.85,"z":-0.19,"angle":0,"damage":[100,100],"rate":5,"type":1,"speed":[60,60],"number":1,"spread":0,"error":120,"recoil":0}],"radius":5.89}}'
        },
        name: "Surge",
        cooldown: 30 * 60,
        duration: 4 * 60,
        endOnDeath: true,

        generatorInit: 0,
    },
    "Wasp": {
        models: {
            default: '{"name":"Wasp","designer":"nex","level":6,"model":26,"size":1.55,"zoom":0.9,"specs":{"shield":{"capacity":[180,180],"reload":[9,9]},"generator":{"capacity":[290,290],"reload":[64,64]},"ship":{"mass":180,"speed":[120,120],"rotation":[82,82],"acceleration":[155,155]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":8,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-70,-43,-47.5,-35,-15,-2.5,12.5,40,80,93,130],"z":[0,0,0,0,0,4,3,8,15,20,8,7,0]},"width":[0,8,13,8,15,17,20,10,20,25,17,8,0],"height":[0,4,8,5,10,15,14,10,15,18,13,8,0],"texture":[1,10,3,18,1,11,4,4,2,10,4,6],"propeller":true},"cannon":{"section_segments":8,"offset":{"x":0,"y":53,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-60,-40,-20,-10,5,35,60],"z":[0,0,0,0,0,10,15,15]},"width":[0,8,10,10,15,15,20,0],"height":[0,8,10,10,15,15,20,0],"texture":[18,13,10,4,4,18,4],"propeller":true,"angle":180,"laser":{"damage":[255,255],"rate":2,"type":2,"speed":[175,175],"number":1,"error":0,"angle":0,"recoil":1000}},"eyes":{"section_segments":8,"offset":{"x":10,"y":-57,"z":0},"position":{"x":[0,0,3,0],"y":[-20,-13,5,15],"z":[0,0,0,0]},"width":[0,5,8,0],"height":[0,5,8,0],"texture":[6,5,4],"propeller":false},"boosters":{"section_segments":8,"offset":{"x":40,"y":8,"z":-4},"position":{"x":[-5,-5,-5,-5,-3,0,0,0],"y":[-55,-50,-40,-20,-5,10,50,40],"z":[0,0,0,0,0,0,0,0]},"width":[0,10,14,15,7,20,15,0],"height":[0,6,12,13,4,13,12,0],"texture":[3,1,11,4,3,4,17],"propeller":true}},"wings":{"wings_back":{"offset":{"x":13,"y":18,"z":5},"length":[35,35,35,25],"width":[10,35,60,40,15],"angle":[25,5,-5,-15],"position":[-5,15,26,33,40],"texture":[13,63,63,2],"doubleside":true,"bump":{"position":20,"size":20}},"wings_front":{"offset":{"x":10,"y":5,"z":5},"length":[25,35,20],"width":[10,40,35,15],"angle":[10,0,-10],"position":[0,-13,-25,-30],"texture":[13,63,2],"doubleside":true,"bump":{"position":20,"size":20}},"bigwingindent":{"offset":{"x":13,"y":18,"z":12},"length":[35,35,36,23.5],"width":[0,15,40,15,0],"angle":[25,5,-2,-20],"position":[-5,15,26,33,40],"texture":[4,17,17,4],"doubleside":true,"bump":{"position":20,"size":20}},"smallwingindent":{"offset":{"x":10,"y":5,"z":12},"length":[25,36,19],"width":[0,25,16,0],"angle":[10,0,-20],"position":[0,-13,-25,-30],"texture":[4,17,4],"doubleside":true,"bump":{"position":20,"size":20}},"antenna":{"offset":{"x":8,"y":-57,"z":-8},"length":[20,20],"width":[25,20,15],"angle":[40,70],"position":[0,-20,-50],"texture":[6],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Wasp","level":6,"model":26,"code":626,"specs":{"shield":{"capacity":[180,180],"reload":[9,9]},"generator":{"capacity":[290,290],"reload":[64,64]},"ship":{"mass":180,"speed":[120,120],"rotation":[82,82],"acceleration":[155,155]}},"shape":[2.542,2.449,3.671,2.759,1.586,1.835,1.906,1.908,2.364,2.828,2.946,2.858,2.483,1.963,3.428,4.621,4.752,4.416,3.812,3.266,2.333,2.128,2.14,2.782,3.512,4.278,3.512,2.782,2.14,2.128,2.333,3.266,3.812,4.416,4.752,4.621,3.428,1.963,2.483,2.858,2.946,2.828,2.364,1.908,1.906,1.835,1.586,2.759,3.671,2.449],"lasers":[{"x":0,"y":3.503,"z":-0.62,"angle":180,"damage":[255,255],"rate":2,"type":2,"speed":[175,175],"number":1,"spread":0,"error":0,"recoil":1000}],"radius":4.752}}'
        },
        name: "Sting",
        cooldown: 33 * 60,
        customEndcondition: true,

        stingDuration: 8 * 60,
        penaltyCooldown: 1 * 60, // CD when it casts ability without nearby enemies

        generatorInit: 0,

        range: 10,
        showAbilityRangeUI: true,
        includeRingOnModel: true,

        tickInterval: 1 * 60,

        damage: 50, // damage applied to enemy ship
        healingRatio: 1, // HP recovered for Wasp for each damage unit applied to enemy

        
        getCooldown: function (ship) {
            return (ship.custom.abilityCustom || {}).noWaspEnemies ? this.penaltyCooldown : this.cooldown;
        },
        
        canStart: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.getCooldown(ship));
        },

        requirementsText: function (ship) {
            return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.getCooldown(ship));
        },

        start: function (ship) {
            let target = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true })[0];

            if (target != null) {
                target.custom.poisonousStart = game.step - 1;
                target.custom.poisonousShip = ship;
            }
            
            ship.custom.abilityCustom.noWaspEnemies = target == null;

            ship.custom.forceEnd = true;
        },

        end: function () {},

        globalTick: function (game) {
            for (let ship of game.ships) {
                if (ship.custom.poisonousShip && ship.custom.poisonousStart != null) {
                    let poisonousTime = game.step - ship.custom.poisonousStart;
                    if (ship.alive && poisonousTime % this.tickInterval == 0) {
                        HelperFunctions.damage(ship, this.damage);
                        ship.custom.poisonousShip.set({shield: ship.custom.poisonousShip.shield + this.damage * this.healingRatio});
                    }

                    if (poisonousTime >= this.stingDuration) ship.custom.poisonousShip = ship.custom.poisonousStart = null;
                }
            }
        },

        event: function (event, ship) {
            if (event.name == "ship_destroyed" && event.ship === ship) (ship.custom.abilityCustom || {}).noWaspEnemies = false;
        }
    },
    "Arcane": {
        models: {
            default: '{"name":"Arcane","designer":"nex","level":6,"model":27,"size":1.6,"specs":{"shield":{"capacity":[200,200],"reload":[4,4]},"generator":{"capacity":[210,210],"reload":[60,60]},"ship":{"mass":190,"speed":[195,195],"rotation":[52,52],"acceleration":[140,140]}},"bodies":{"C15":{"section_segments":6,"offset":{"x":95,"y":130,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C16":{"section_segments":6,"offset":{"x":85,"y":115,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C17":{"section_segments":6,"offset":{"x":72,"y":97,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C18":{"section_segments":6,"offset":{"x":58,"y":85,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C19":{"section_segments":6,"offset":{"x":42.4,"y":74.5,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C20":{"section_segments":6,"offset":{"x":27,"y":66.1,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C21":{"section_segments":6,"offset":{"x":10,"y":61.900000000000006,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C22":{"section_segments":6,"offset":{"x":90,"y":121,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C23":{"section_segments":6,"offset":{"x":79,"y":106,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C24":{"section_segments":6,"offset":{"x":65,"y":91,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C25":{"section_segments":6,"offset":{"x":50,"y":79,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C26":{"section_segments":6,"offset":{"x":35,"y":70,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C27":{"section_segments":6,"offset":{"x":18,"y":64,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"C28":{"section_segments":6,"offset":{"x":0,"y":61,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"laser":{"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"error":0},"propeller":false,"texture":[17]},"main_INDICATOR":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-75,-65,-50,-20,10,30,50,70,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,14.5,18,20,20,16,16,20,20,0],"height":[0,3,7,9,10,10,7,7,10,10,0],"texture":[4,63,1,11,10,4,13,4,8,17],"propeller":true,"laser":{"damage":[200,200],"rate":10,"type":2,"speed":[1,1],"number":100,"error":0}},"cockpit":{"section_segments":[40,80,180,280,320],"offset":{"x":0,"y":10,"z":6},"position":{"x":[0,0,0,0,0,0,0],"y":[-56,-50,-30,-10,20,40,50],"z":[3,0,0,0,0,0,0]},"width":[0,6,10,14,8,6,0],"height":[0,8,10,10,8,6,0],"texture":[7,8.98,8.98,4],"propeller":false},"top_propulsor_sussy":{"section_segments":12,"offset":{"x":0,"y":75,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,-35,-20,-5,10,20,35,60,50],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,9,14,16,16,12,12,18,16,0],"height":[0,9,14,16,16,12,12,18,16,0],"texture":[3,2,4,8,4,3,4,15,17],"propeller":true},"side_propellers_sussyamogus":{"section_segments":8,"offset":{"x":25,"y":90,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,-35,-20,-5,10,20,35,60,50],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,9,14,16,16,12,12,18,16,0],"height":[0,9,14,16,16,12,12,18,16,0],"texture":[3,2,63,63,4,3,4,15,17],"propeller":true}},"wings":{"extra_wing":{"offset":{"x":0,"y":-60,"z":-12},"length":[11,13,11],"width":[170,125,65,20],"angle":[0,0,0],"position":[10,-5,-13,15],"texture":[63,1,3],"doubleside":true,"bump":{"position":10,"size":10}},"extra_wings":{"offset":{"x":0,"y":60,"z":15},"length":[8,15,15],"width":[120,100,60,20],"angle":[0,0,0],"position":[0,-6,-12,15],"texture":[63,1,3],"doubleside":true,"bump":{"position":10,"size":5}},"wingarse":{"offset":{"x":11,"y":20,"z":-10},"length":[15,10],"width":[100,60,30],"angle":[0,0],"position":[0,0,20],"texture":[2,63],"doubleside":true,"bump":{"position":0,"size":10}},"pinglets":{"offset":{"x":35,"y":81,"z":-10},"length":[35],"width":[35,15],"angle":[-30],"position":[0,30],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}},"blooming_lotus":{"offset":{"x":35,"y":115,"z":-10},"length":[35],"width":[35,15],"angle":[-30],"position":[0,30],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Arcane","level":6,"model":27,"code":627,"specs":{"shield":{"capacity":[200,200],"reload":[4,4]},"generator":{"capacity":[210,210],"reload":[60,60]},"ship":{"mass":190,"speed":[195,195],"rotation":[52,52],"acceleration":[140,140]}},"shape":[4.32,4.148,3.595,2.905,2.411,2.086,1.754,0.872,0.865,0.887,0.891,0.897,0.922,0.964,1.026,1.117,1.247,1.419,1.578,1.802,2.392,4.906,5.309,4.976,4.886,4.809,4.886,4.976,5.309,4.906,2.392,1.802,1.578,1.419,1.247,1.117,1.026,0.964,0.922,0.897,0.891,0.887,0.865,0.872,1.754,2.086,2.411,2.905,3.595,4.148],"lasers":[{"x":3.04,"y":4.16,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.04,"y":4.16,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.72,"y":3.68,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.72,"y":3.68,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.304,"y":3.104,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.304,"y":3.104,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.856,"y":2.72,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.856,"y":2.72,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.357,"y":2.384,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.357,"y":2.384,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.864,"y":2.115,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.864,"y":2.115,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.32,"y":1.981,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.32,"y":1.981,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.88,"y":3.872,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.88,"y":3.872,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.528,"y":3.392,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.528,"y":3.392,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.08,"y":2.912,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.08,"y":2.912,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.6,"y":2.528,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.6,"y":2.528,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.12,"y":2.24,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.12,"y":2.24,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.576,"y":2.048,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.576,"y":2.048,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":1.952,"z":0,"angle":0,"damage":[7.407407407407407,7.407407407407407],"rate":0.3,"type":1,"speed":[150,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.56,"z":0,"angle":0,"damage":[200,200],"rate":10,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":5.309}}',
            ability: '{"name":"Arcane","designer":"nex","level":7,"model":27,"size":1.65,"specs":{"shield":{"capacity":[320,320],"reload":[15,15]},"generator":{"capacity":[6500,6500],"reload":[1000,1000]},"ship":{"mass":230,"speed":[60,60],"rotation":[45,45],"acceleration":[80,80]}},"bodies":{"cannon":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,5,0],"height":[0,5,0],"angle":0,"laser":{"damage":[40.625,40.625],"rate":1,"type":1,"speed":[40,40],"number":160,"angle":360},"propeller":false,"texture":[3,3,10,3]},"main_INDICATOR":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-75,-65,-50,-20,10,30,50,70,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,14.5,18,20,20,16,16,20,20,0],"height":[0,3,7,9,10,10,7,7,10,10,0],"texture":[4,4,3,11,10,4,13,4,8,17],"propeller":true,"laser":{"damage":[6500,6500],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"recoil":0}},"cockpit":{"section_segments":[40,80,180,280,320],"offset":{"x":0,"y":-10,"z":6},"position":{"x":[0,0,0,0,0,0,0],"y":[-56,-50,-30,-10,20,40,50],"z":[3,0,0,0,0,0,0]},"width":[0,6,10,14,8,6,0],"height":[0,8,10,10,8,6,0],"texture":[5,5,17,4],"propeller":false},"top_propulsor_sussy":{"section_segments":12,"offset":{"x":0,"y":55,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,-35,-20,-5,10,20,35,60,50],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,9,14,16,16,12,12,18,16,0],"height":[0,9,14,16,16,12,12,18,16,0],"texture":[3,2,4,8,4,3,4,15,17],"propeller":true},"side_propellers_sussyamogus":{"section_segments":8,"offset":{"x":25,"y":70,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,-35,-20,-5,10,20,35,60,50],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,9,14,16,16,12,12,18,16,0],"height":[0,9,14,16,16,12,12,18,16,0],"texture":[3,2,63,63,4,3,4,15,17],"propeller":true}},"wings":{"extra_wing":{"offset":{"x":0,"y":-80,"z":-12},"length":[30,0,6,10,18],"width":[30,30,170,125,65,20],"angle":[0,0,0,0,0],"position":[50,0,-10,-25,-40,0],"texture":[17,63,63,4,3],"doubleside":true,"bump":{"position":10,"size":5}},"extra_wings":{"offset":{"x":0,"y":40,"z":15},"length":[8,15,15],"width":[120,100,60,20],"angle":[0,0,0],"position":[0,-6,-12,15],"texture":[63,4,3],"doubleside":true,"bump":{"position":10,"size":5}},"wingarse":{"offset":{"x":15,"y":0,"z":-10},"length":[15,10],"width":[100,60,30],"angle":[0,0],"position":[0,0,20],"texture":[2,63],"doubleside":true,"bump":{"position":0,"size":10}},"pinglets":{"offset":{"x":35,"y":61,"z":-10},"length":[35],"width":[35,15],"angle":[-30],"position":[0,30],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}},"blooming_lotus":{"offset":{"x":35,"y":95,"z":-10},"length":[35],"width":[35,15],"angle":[-30],"position":[0,30],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Arcane","level":7,"model":27,"code":727,"specs":{"shield":{"capacity":[320,320],"reload":[15,15]},"generator":{"capacity":[6500,6500],"reload":[1000,1000]},"ship":{"mass":230,"speed":[60,60],"rotation":[45,45],"acceleration":[80,80]}},"shape":[3.3,5.859,5.763,5.077,4.313,3.796,3.309,1.548,1.342,1.254,1.229,1.238,1.271,1.33,1.361,1.419,1.503,1.63,1.775,2.117,3.9,4.875,4.721,4.498,4.367,3.802,4.367,4.498,4.721,4.875,3.9,2.117,1.775,1.63,1.503,1.419,1.361,1.33,1.271,1.238,1.229,1.254,1.342,1.548,3.309,3.796,4.313,5.077,5.763,5.859],"lasers":[{"x":0,"y":-0.33,"z":0,"angle":0,"damage":[40.625,40.625],"rate":1,"type":1,"speed":[40,40],"number":160,"spread":360,"error":0,"recoil":0},{"x":0,"y":-3.3,"z":0,"angle":0,"damage":[6500,6500],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":5.859}}'
        },
        name: "Impulse",
        cooldown: 40 * 60,
        duration: 4 * 60,
        endOnDeath: true,

        limitVelocityDelay: 3.25 * 60,
        limitVelocityTick: 0.25 * 60,

        speedLimit: 0.5, // to prevent abuse

        start: function (ship) {
            HelperFunctions.templates.start.call(this, ship);
            ship.custom.abilityCustom.limitVeloc = false;
            ship.set({generator: 3000});
        },

        tick: function (ship, duration) {
            if (!ship.custom.abilityCustom.limitVeloc && duration >= this.limitVelocityDelay) ship.custom.abilityCustom.limitVeloc = true;
            if (ship.custom.abilityCustom.limitVeloc) {
                let speedRatio = this.speedLimit <= 0 ? 0 : (this.speedLimit / Math.sqrt(ship.vx ** 2 + ship.vy ** 2));
                if (speedRatio < 1) ship.set({ vx: ship.vx * speedRatio, vy: ship.vy * speedRatio });
            }
        },

        compile: function () {
            this.tickInterval = this.limitVelocityTick;
        }
    },
    // season 2
    "Erebos": {
        models: {
            default: '{"name":"Erebos","designer":"nex","level":6,"model":28,"size":1.18,"specs":{"shield":{"capacity":[240,240],"reload":[4,4]},"generator":{"capacity":[500,500],"reload":[120,120]},"ship":{"mass":300,"speed":[150,150],"rotation":[70,70],"acceleration":[145,145]}},"bodies":{"black_hole":{"section_segments":16,"angle":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-31.2,-30,-26.4,-18,0,18,26.4,30,31.2],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,12,20.4,28.799999999999997,33.6,28.799999999999997,20.4,12,0],"height":[0,12,20.4,28.799999999999997,33.6,28.799999999999997,20.4,12,0],"texture":[5],"vertical":true,"laser":{"damage":[100,100],"rate":1,"type":1,"speed":[3,3],"number":5,"error":0,"angle":288,"recoil":0}},"magneticfieldgenerator":{"section_segments":16,"offset":{"x":0,"y":-5,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[25.5,-8.5,-17,-8.5,0,25.5,25.5],"z":[0,0,0,0,0,0,0]},"width":[51,59.5,68,70.5,73.75,85.25,59.5],"height":[51,59.5,68,76.5,102,140.25,59.5],"texture":[16,4,4,2,63,4],"propeller":false,"vertical":true,"angle":180,"laser":{"damage":[500,500],"rate":1,"type":2,"speed":[4,4],"number":100,"error":0,"angle":0,"recoil":0}},"needle1":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":0},"needle2":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":180},"needle3":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":90},"needle4":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":-90},"needle5":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":45},"needle6":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":-45},"needle7":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":-135},"needle8":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":135},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[9],"propeller":false},"top_thruster":{"section_segments":8,"offset":{"x":35,"y":10,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[40,45,50,50,75,90,105,120,170,130],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,15,30,35,35,25,35,35,30,0],"height":[0,15,23,25,25,20,25,27,25,0],"texture":[1,4,11,1,3,3,63,8,17],"propeller":true},"cannon":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4,2,4],"propeller":true,"angle":0}},"wings":{"main":{"offset":{"x":25,"y":-120,"z":-20},"length":[35,25,25],"width":[110,90,60,10],"angle":[10,-30,0],"position":[0,45,55,10],"texture":[18,4,63],"doubleside":true,"bump":{"position":20,"size":15}},"spoiler":{"offset":{"x":0,"y":120,"z":35},"length":[40,25,55,25],"width":[50,60,90,50,10],"angle":[0,0,-70,0],"position":[-20,-10,0,-45,-20],"texture":[18,63,4,63],"doubleside":true,"bump":{"position":0,"size":15}},"sidewings":{"offset":{"x":80,"y":0,"z":-15},"length":[55],"width":[50,10],"angle":[-10],"position":[0,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Erebos","level":6,"model":28,"code":628,"specs":{"shield":{"capacity":[240,240],"reload":[4,4]},"generator":{"capacity":[500,500],"reload":[120,120]},"ship":{"mass":300,"speed":[150,150],"rotation":[70,70],"acceleration":[145,145]}},"shape":[3.31,4.172,3.954,3.51,3.193,3.042,3.693,3.335,2.701,2.299,2.121,2.612,3.177,3.186,2.612,2.121,2.149,2.734,3.521,3.569,3.401,3.865,4.516,4.466,4.324,4.256,4.324,4.466,4.516,3.865,3.401,3.569,3.521,2.734,2.149,2.121,2.612,3.177,3.186,2.612,2.121,2.299,2.701,3.335,3.693,3.042,3.193,3.51,3.954,4.172],"lasers":[{"x":0,"y":-0.736,"z":0,"angle":0,"damage":[100,100],"rate":1,"type":1,"speed":[3,3],"number":5,"spread":288,"error":0,"recoil":0},{"x":0,"y":0.283,"z":0,"angle":180,"damage":[500,500],"rate":1,"type":2,"speed":[4,4],"number":100,"spread":0,"error":0,"recoil":0}],"radius":4.516}}',
            ability: '{"name":"Erebos","designer":"nex","level":7,"model":28,"size":1.2,"specs":{"shield":{"capacity":[500,500],"reload":[15,15]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":10000,"speed":[1,1],"rotation":[0.001,0.001],"acceleration":[40,40]}},"bodies":{"black_hole":{"section_segments":30,"angle":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-128.7,-123.75,-108.89999999999999,-74.25,0,74.25,108.89999999999999,123.75,128.7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,49.5,84.14999999999999,118.79999999999998,138.60000000000002,118.79999999999998,84.14999999999999,49.5,0],"height":[0,49.5,84.14999999999999,118.79999999999998,138.60000000000002,118.79999999999998,84.14999999999999,49.5,0],"texture":[5],"vertical":true},"black_hole2":{"section_segments":30,"angle":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-128.69130272700002,-123.74163723750002,-108.89264076900001,-74.2449823425,0,74.2517325,108.89264076900001,123.74163723750002,128.69130272700002],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,49.496654895,84.1443133215,118.79197174799998,138.590633706,118.79197174799998,84.1443133215,49.496654895,0],"height":[0,49.496654895,84.1443133215,118.79197174799998,138.590633706,118.79197174799998,84.1443133215,49.496654895,0],"texture":[17],"vertical":true},"magneticfieldgenerator":{"section_segments":16,"offset":{"x":0,"y":-5,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[25.5,-8.5,-17,-8.5,0,25.5,25.5],"z":[0,0,0,0,0,0,0]},"width":[51,59.5,68,76.5,80.75,89.25,59.5],"height":[51,59.5,68,76.5,102,140.25,59.5],"texture":[16,4,4,2,63,4],"propeller":false,"vertical":true,"angle":180},"needle1":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":0},"needle2":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":180},"needle3":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":90},"needle4":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":-90},"needle5":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":45},"needle6":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":-45},"needle7":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":-135},"needle8":{"section_segments":4,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,55,50,60,95,135],"z":[0,0,0,15,-1,-25]},"width":[0,2,7,15,10,0],"height":[0,2,7,30,10,0],"texture":[17,15,15,8,4],"propeller":false,"angle":135},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[9],"propeller":false},"top_thruster":{"section_segments":8,"offset":{"x":35,"y":10,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[40,45,50,50,75,90,105,120,170,130],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,15,30,35,35,25,35,35,30,0],"height":[0,15,23,25,25,20,25,27,25,0],"texture":[1,4,11,1,3,3,63,8,17],"propeller":false}},"wings":{"main":{"offset":{"x":25,"y":-120,"z":-20},"length":[35,25,30],"width":[110,90,60,10],"angle":[10,-30,0],"position":[0,45,55,10],"texture":[18,4,63],"doubleside":true,"bump":{"position":20,"size":15}},"spoiler":{"offset":{"x":0,"y":120,"z":35},"length":[40,25,55,35],"width":[50,60,90,50,10],"angle":[0,0,-70,0],"position":[-20,-10,0,-55,-20],"texture":[18,63,4,63],"doubleside":true,"bump":{"position":0,"size":15}},"sidewings":{"offset":{"x":80,"y":0,"z":-15},"length":[65],"width":[50,10],"angle":[-10],"position":[0,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Erebos","level":7,"model":28,"code":728,"specs":{"shield":{"capacity":[500,500],"reload":[15,15]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":10000,"speed":[1,1],"rotation":[0.001,0.001],"acceleration":[40,40]}},"shape":[3.366,4.243,4.021,3.57,3.319,3.326,3.838,3.636,3.326,3.319,3.326,3.319,3.458,3.458,3.319,3.326,3.319,3.326,3.805,3.486,3.453,3.925,4.593,4.542,4.397,4.328,4.397,4.542,4.593,3.925,3.453,3.486,3.805,3.326,3.319,3.326,3.319,3.458,3.458,3.319,3.326,3.319,3.326,3.636,3.838,3.326,3.319,3.57,4.021,4.243],"lasers":[],"radius":4.593}}'
        },
        name: "Vacuum",
        cooldown: 65 * 60,
        duration: 6.5 * 60,
        endOnDeath: true,

        pullInterval: 1 * 60,

        range: 55,
        includeRingOnModel: true,
        showAbilityRangeUI: true,

        pullStrength: 1,

        start: function (ship) {
            HelperFunctions.templates.start.call(this, ship);
            ship.set({ idle: true });
        },

        end: function (ship) {
            HelperFunctions.templates.end.call(this, ship);
            ship.set({ idle: false });
        },

        tick: function (ship, duration) {
            if (this.pullInterval > AbilityManager.updateDelay && duration % this.pullInterval == (this.pullInterval - AbilityManager.updateDelay)) {
                // request to update info before pull
                AbilityManager.requestEntitiesInfoUpdate();
            }

            if (duration % this.pullInterval == 0) {
                // each pull interval => pull ships
                let targets = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true, aliens: true, asteroids: true }, true);
                for (let target of targets) HelperFunctions.accelerateToTarget(target, ship, this.pullStrength);
            }
        }
    },
    "Viking": {
        models: {
            default: '{"name":"Viking","designer":"nex","level":6,"model":29,"size":1.52,"zoom":0.82,"specs":{"shield":{"capacity":[275,275],"reload":[6,6]},"generator":{"capacity":[130.01,130.01],"reload":[65,65]},"ship":{"mass":220,"speed":[105,105],"rotation":[100,100],"acceleration":[160,160]}},"bodies":{"endless_dungeon":{"section_segments":12,"offset":{"x":0,"y":25,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-80,-55,-20,45,-20,40,70,100,90],"z":[-5,-5,-5,-5,-5,0,-6,1,0,0,0]},"width":[0,17,20,20,20,35,8,16,30,25,0],"height":[0,7,7,10,10,13,12,20,20,13,0],"texture":[3,2,1,10,2,4,4,63,11],"propeller":true},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-35,"z":7},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-35,-20,10,30,40,60,70,100],"z":[-5,0,0,0,0,-10,-10,-10]},"width":[0,7,13,14,18,15,15,0],"height":[0,5,15,15,18,10,10,0],"texture":[9,9,9,2,4,2,4,2,4],"laser":{"damage":[130,130],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"angle":0,"recoil":0},"propeller":false},"side_pwopulsows_uwu":{"section_segments":6,"offset":{"x":40,"y":55,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-25,-10,10,20,30,70,60],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,18,18,12,18,15,0],"height":[0,18,22,22,15,22,18,0],"texture":[3,2,10,4,4,8,17],"propeller":true},"bubble_tea_supremacy":{"section_segments":8,"offset":{"x":30,"y":5,"z":20},"position":{"x":[-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,10],"y":[-90,-100,-90,-70,-55,0,15,30,40,70,100,90],"z":[0,0,0,0,0,0,0,0,0,0,-15,-15]},"width":[0,7,9,9,7,7,9,9,13,20,15,0],"height":[0,8,10,10,8,8,10,10,16,20,15,0],"texture":[6,4,3,4,48,4,3,63,4,13],"propeller":false,"angle":0},"lasers":{"section_segments":0,"offset":{"x":0,"y":-2500,"z":20},"position":{"x":[-30],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":180,"laser":{"damage":[5,130],"rate":1,"type":2,"speed":[550,550],"number":1,"error":0,"angle":0,"recoil":0}},"lasers2":{"section_segments":0,"offset":{"x":0,"y":-2500,"z":20},"position":{"x":[30],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[17],"propeller":false,"angle":180,"laser":{"damage":[5,130],"rate":1,"type":2,"speed":[550,550],"number":1,"error":0,"angle":0,"recoil":0}},"missiles":{"section_segments":8,"offset":{"x":35,"y":-5,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-40,-50,-35,-20,5,20,50,65,100,70],"z":[-15,-15,-15,-15,-10,0,0,0,0,0]},"width":[0,13,15,18,18,13,13,20,15,0],"height":[0,17,18,23,23,15,15,20,17,0],"texture":[4,13,63,11,4,48,4,11],"propeller":true,"angle":0}},"wings":{"wig":{"offset":{"x":0,"y":110,"z":25},"length":[40,30,20],"width":[50,30,30,0],"angle":[20,0,0],"position":[-10,0,10,40],"texture":[63],"doubleside":true,"bump":{"position":20,"size":10}},"sick_jawline":{"offset":{"x":20,"y":-60,"z":-4},"length":[-10,20,25],"width":[0,70,130,0],"angle":[0,0,0],"position":[0,-25,5,30],"texture":[4,8,63],"doubleside":true,"bump":{"position":35,"size":8}},"slick_jawline":{"offset":{"x":0,"y":55,"z":0},"length":[-10,70,20,50],"width":[0,70,100,60,0],"angle":[0,-10,0,-10],"position":[0,0,15,-30,-10],"texture":[4,4,63,1],"doubleside":true,"bump":{"position":40,"size":10}}},"typespec":{"name":"Viking","level":6,"model":29,"code":629,"specs":{"shield":{"capacity":[275,275],"reload":[6,6]},"generator":{"capacity":[130.01,130.01],"reload":[65,65]},"ship":{"mass":220,"speed":[105,105],"rotation":[100,100],"acceleration":[160,160]}},"shape":[2.28,3.713,3.76,3.349,2.828,2.484,2.256,2.094,1.978,1.905,1.73,1.663,2.534,2.931,3.511,4.13,3.871,3.27,3.094,3.329,3.959,5.28,4.475,4.03,3.868,3.807,3.868,4.03,4.475,5.28,3.959,3.329,3.094,3.27,3.871,4.13,3.511,2.931,2.549,1.663,1.73,1.905,1.978,2.094,2.256,2.484,2.828,3.349,3.76,3.713],"lasers":[{"x":0,"y":-2.128,"z":0.213,"angle":0,"damage":[130,130],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0},{"x":0.912,"y":-76,"z":0.608,"angle":180,"damage":[5,130],"rate":1,"type":2,"speed":[550,550],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.912,"y":-76,"z":0.608,"angle":180,"damage":[5,130],"rate":1,"type":2,"speed":[550,550],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.28}}',
            ability: '{"name":"Viking","designer":"nex","level":7,"model":29,"size":1.6,"specs":{"shield":{"capacity":[400,400],"reload":[4,4]},"generator":{"capacity":[150,150],"reload":[80,80]},"ship":{"mass":400,"speed":[75,75],"rotation":[58,58],"acceleration":[140,140]}},"bodies":{"endless_dungeon":{"section_segments":12,"offset":{"x":0,"y":25,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-80,-55,-20,45,-20,40,70,100,90],"z":[-5,-5,-5,-5,-5,0,-6,1,0,0,0]},"width":[0,17,20,20,20,35,8,16,30,25,0],"height":[0,7,7,10,10,13,12,20,20,13,0],"texture":[3,2,1,10,2,4,4,63,11],"propeller":true},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-35,"z":7},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-35,-20,10,30,40,60,70,100],"z":[-5,0,0,0,0,-10,-10,-10]},"width":[0,8,13,14,18,15,15,0],"height":[0,5,15,15,18,10,10,0],"texture":[9,9,9,2,4,2,4,2,4],"propeller":false,"laser":{"damage":[130,130],"rate":1,"type":2,"speed":[100,100],"number":100,"error":0,"angle":0,"recoil":0}},"side_pwopulsows_uwu":{"section_segments":6,"offset":{"x":40,"y":55,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-25,-10,10,20,30,70,60],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,18,18,12,18,15,0],"height":[0,18,22,22,15,22,18,0],"texture":[3,2,10,4,4,8,17],"propeller":true},"bubble_tea_supremacy":{"section_segments":8,"offset":{"x":30,"y":25,"z":10},"position":{"x":[-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,10],"y":[-30,-40,-30,-10,0,20,30,50,40,70,100,90],"z":[0,0,0,0,0,0,0,0,0,0,-15,-15]},"width":[0,7,9,9,7,7,9,9,13,20,15,0],"height":[0,8,10,10,8,8,10,10,16,20,15,0],"texture":[6,4,3,4,48,4,3,63,4,13],"propeller":false,"angle":0},"missile_launcher":{"section_segments":8,"offset":{"x":0,"y":-65,"z":-15},"position":{"x":[30,30,30,30,30,30,30,30,30,30],"y":[-40,-50,-35,-20,5,20,60,75,100,70],"z":[-15,-15,-15,-15,-10,0,0,0,0,0]},"width":[0,13,15,18,18,13,13,20,15,0],"height":[0,17,18,23,23,15,15,20,17,0],"texture":[4,13,63,11,4,48,4,11],"propeller":true,"angle":0,"laser":{"damage":[5,130],"rate":1,"type":2,"speed":[100,100],"number":1,"error":0,"angle":0,"recoil":150}},"missile_launcher2":{"section_segments":8,"offset":{"x":0,"y":-65,"z":-15},"position":{"x":[-30,-30,-30,-30,-30,-30,-30,-30,-30,-30],"y":[-40,-50,-35,-20,5,20,60,75,100,70],"z":[-15,-15,-15,-15,-10,0,0,0,0,0]},"width":[0,13,15,18,18,13,13,20,15,0],"height":[0,17,18,23,23,15,15,20,17,0],"texture":[4,13,63,11,4,48,4,11],"propeller":true,"angle":0,"laser":{"damage":[5,130],"rate":1,"type":1,"speed":[100,100],"number":1,"error":0,"angle":0,"recoil":150}},"rocket1":{"section_segments":8,"offset":{"x":30,"y":-125,"z":-40},"position":{"x":[0,0,0,0,0],"y":[0,4,12,30,50],"z":[0,0,0,0,0]},"width":[0,5,7,10,0],"height":[0,5,7,10,0],"texture":[6,63,3],"propeller":true,"angle":0},"rocket2":{"section_segments":8,"offset":{"x":37,"y":-125,"z":-31},"position":{"x":[0,0,0,0,0],"y":[0,4,12,30,50],"z":[0,0,0,0,0]},"width":[0,5,7,10,0],"height":[0,5,7,10,0],"texture":[6,63,3],"propeller":true,"angle":0},"rocket3":{"section_segments":8,"offset":{"x":30,"y":-125,"z":-22},"position":{"x":[0,0,0,0,0],"y":[0,4,12,30,50],"z":[0,0,0,0,0]},"width":[0,5,7,10,0],"height":[0,5,7,10,0],"texture":[6,63,3],"propeller":true,"angle":0},"rocket4":{"section_segments":8,"offset":{"x":24,"y":-125,"z":-31},"position":{"x":[0,0,0,0,0],"y":[0,4,12,30,50],"z":[0,0,0,0,0]},"width":[0,5,7,10,0],"height":[0,5,7,10,0],"texture":[6,63,3],"propeller":true,"angle":0}},"wings":{"wig":{"offset":{"x":0,"y":115,"z":38},"length":[25,-5,30,30,20],"width":[30,30,70,40,30,0],"angle":[9,-20,-20,-50,-70],"position":[6,6,10,0,-10,-40],"texture":[8,8,63],"doubleside":true,"bump":{"position":20,"size":10}},"sick_jawline":{"offset":{"x":50,"y":-55,"z":-34},"length":[-10,20,25],"width":[0,70,130,0],"angle":[0,30,30],"position":[0,-25,5,30],"texture":[4,8,63],"doubleside":true,"bump":{"position":35,"size":8}},"slick_jawline":{"offset":{"x":0,"y":75,"z":0},"length":[-10,70,20,30],"width":[0,70,100,60,0],"angle":[0,-10,0,-10],"position":[0,0,15,-30,-30],"texture":[4,4,63,1],"doubleside":true,"bump":{"position":40,"size":10}}},"typespec":{"name":"Viking","level":7,"model":29,"code":729,"specs":{"shield":{"capacity":[400,400],"reload":[4,4]},"generator":{"capacity":[150,150],"reload":[80,80]},"ship":{"mass":400,"speed":[75,75],"rotation":[58,58],"acceleration":[140,140]}},"shape":[2.4,4.067,4.172,4.128,4.112,3.678,3.294,3.035,2.854,2.74,2.669,2.508,2.26,2.091,2.832,3.61,3.758,3.619,3.522,3.722,4.195,4.631,4.861,4.952,5.16,4.36,5.16,4.952,4.861,4.631,4.195,3.722,3.522,3.619,3.758,3.61,2.832,2.091,2.26,2.508,2.669,2.74,2.854,3.035,3.294,3.678,4.112,4.128,4.172,4.067],"lasers":[{"x":0,"y":-2.24,"z":0.224,"angle":0,"damage":[130,130],"rate":1,"type":2,"speed":[100,100],"number":100,"spread":0,"error":0,"recoil":0},{"x":0.96,"y":-3.68,"z":-0.48,"angle":0,"damage":[5,130],"rate":1,"type":2,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":150},{"x":-0.96,"y":-3.68,"z":-0.48,"angle":0,"damage":[5,130],"rate":1,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":150}],"radius":5.16}}'
        },
        name: "Defensive",
        cooldown: 15 * 60,

        customEndcondition: true,

        endName: "Offensive",
        defensiveCooldown: 15 * 60,

        stateSpeed: 0.2, // accelerating speed when switching between forms

        getCooldown: function (ship) {
            return ship.custom.abilityCustom.isDefensive ? this.defensiveCooldown : this.cooldown;
        },

        getDefaultShipCode: function (ship) {
            return this.codes[ship.custom.abilityCustom.isDefensive ? "ability" : "default"];
        },

        canStart: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.getCooldown(ship));
        },

        abilityName: function (ship) {
            return ship.custom.abilityCustom.isDefensive ? this.endName : this.name;
        },

        requirementsText: function (ship) {
            return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.getCooldown(ship));
        },

        start: function (ship) {
            let isDefensive = ship.custom.abilityCustom.isDefensive = !ship.custom.abilityCustom.isDefensive;
            let model = isDefensive ? "ability" : "default";
            ship.set({
                type: this.codes[model],
                stats: AbilityManager.maxStats,
                generator: this.energy_capacities[model]
            });
            HelperFunctions.accelerate(ship,  this.stateSpeed * ((-1) ** !!isDefensive));
            ship.custom.forceEnd = true;
        },

        end: function () {},

        reload: function (ship) {
            ship.custom.lastTriggered = game.step - this.getCooldown(ship);
        }
    },
    "Synthesis": {
        models: {
            default: '{"name":"Synthesis","designer":"nex","level":6,"model":30,"size":1.4,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[50,50],"reload":[800,800]},"ship":{"mass":255,"speed":[118,118],"rotation":[75,75],"acceleration":[120,120]}},"bodies":{"THE__ONE__PIEEEEECE":{"section_segments":7,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-85,-90,-60,-70,-30,10,40,60,80,120,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,16,16,18,20,28,27,20,20,20,0],"height":[0,10,10,10,10,15,15,10,10,10,0],"texture":[49,1,2,63,1,10,4,13,8,17],"propeller":true},"is_one_piece":{"section_segments":16,"offset":{"x":0,"y":-18,"z":-95},"position":{"x":[-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40],"y":[0,0,0,0,0,17,15,22,18,13,5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,45,65,52.5,40,30,27,22,24,24],"height":[18,18,18,45,65,52.5,40,30,27,22,24,24],"texture":[4,3,13,3,63,49.5,12,18,17],"vertical":true,"angle":0},"the_best":{"section_segments":12,"offset":{"x":16,"y":3,"z":-45},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[35,35,20,20,20],"height":[35,35,20,20,20],"texture":[63],"vertical":true},"anime_of_all_times":{"section_segments":12,"offset":{"x":0,"y":-5,"z":5},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[40,40,30,30,30],"height":[30,30,20,20,20],"texture":[63],"vertical":true},"best_anime_ever":{"section_segments":6,"offset":{"x":0,"y":45,"z":5.7},"position":{"x":[0,0,0,0,0],"y":[-95,-55,-30,-10,15],"z":[0,0,0,0,10]},"width":[6,9,13,17,0],"height":[6,9,10,10,0],"texture":[8,9,9,4],"propeller":false},"midterm_exam":{"section_segments":6,"offset":{"x":7,"y":-70,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-80,-10,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,2,63,4],"propeller":false,"angle":0,"laser":{"damage":[50,50],"rate":0.45,"type":1,"speed":[180,180],"number":1,"error":0,"angle":0,"recoil":50}},"final_exam":{"section_segments":6,"offset":{"x":0,"y":-70,"z":4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-90,-15,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,4,63,4],"propeller":false,"angle":0,"laser":{"damage":[50,50],"rate":0.45,"type":1,"speed":[180,180],"number":1,"error":0,"angle":0,"recoil":50}},"barre1":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-85},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barre2":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-105},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barre3":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-125},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]}},"wings":{"shield":{"offset":{"x":0,"y":-30,"z":-1},"length":[25,13,32,25],"width":[50,80,70,40,20],"angle":[-40,0,90,190],"position":[0,-40,-40,-10,15],"texture":[12,63,8,2],"doubleside":true,"bump":{"position":30,"size":10}},"winglets":{"offset":{"x":10,"y":70,"z":0},"length":[50],"width":[50,20],"angle":[20],"position":[0,0],"texture":[3],"doubleside":true,"bump":{"position":-21,"size":15}},"sir_no_talks_in_library":{"offset":{"x":12,"y":30,"z":-10},"length":[20,25],"width":[120,90,50],"angle":[0,-20],"position":[0,0,20],"texture":[13,1],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Synthesis","level":6,"model":30,"code":630,"specs":{"shield":{"capacity":[300,300],"reload":[10,10]},"generator":{"capacity":[50,50],"reload":[800,800]},"ship":{"mass":255,"speed":[118,118],"rotation":[75,75],"acceleration":[120,120]}},"shape":[4.483,4.216,3.116,2.96,2.349,1.965,1.667,1.255,1.122,1.116,1.106,1.128,1.139,1.241,1.386,1.6,1.773,1.915,2.129,2.501,2.75,2.708,3.695,3.887,3.958,4.243,4.504,4.644,4.706,4.67,4.585,4.376,4.009,3.483,2.261,1.6,1.386,1.241,1.139,1.128,1.106,1.116,1.122,1.255,1.667,1.965,2.349,2.96,3.116,4.216],"lasers":[{"x":0.196,"y":-4.2,"z":-0.196,"angle":0,"damage":[50,50],"rate":0.45,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":50},{"x":-0.196,"y":-4.2,"z":-0.196,"angle":0,"damage":[50,50],"rate":0.45,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":50},{"x":0,"y":-4.48,"z":0.112,"angle":0,"damage":[50,50],"rate":0.45,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":50}],"radius":4.706}}',
            stage1: '{"name":"Synthesis S1","designer":"nex","level":7,"model":91,"size":1.4,"specs":{"shield":{"capacity":[320,320],"reload":[10,10]},"generator":{"capacity":[250,250],"reload":[0.001,0.001]},"ship":{"mass":300,"speed":[118,118],"rotation":[80,80],"acceleration":[120,120]}},"bodies":{"THE__ONE__PIEEEEECE":{"section_segments":7,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-85,-90,-60,-70,-30,10,40,60,80,120,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,16,16,18,20,28,27,20,20,20,0],"height":[0,10,10,10,10,15,15,10,10,10,0],"texture":[49,1,2,63,1,10,4,13,8,17],"propeller":true},"is_one_piece":{"section_segments":16,"offset":{"x":0,"y":-18,"z":-95},"position":{"x":[-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40],"y":[0,0,0,0,0,17,15,22,18,13,5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,45,65,52.5,40,30,27,22,24,24],"height":[18,18,18,45,65,52.5,40,30,27,22,24,24],"texture":[4,3,13,3,63,49.5,12,18,17],"vertical":true,"angle":0},"the_best":{"section_segments":12,"offset":{"x":16,"y":3,"z":-45},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[35,35,20,20,20],"height":[35,35,20,20,20],"texture":[63],"vertical":true},"anime_of_all_times":{"section_segments":12,"offset":{"x":0,"y":-5,"z":5},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[40,40,30,30,30],"height":[30,30,20,20,20],"texture":[63],"vertical":true},"best_anime_ever":{"section_segments":6,"offset":{"x":0,"y":45,"z":5.7},"position":{"x":[0,0,0,0,0],"y":[-95,-55,-30,-10,15],"z":[0,0,0,0,10]},"width":[6,9,17,17,0],"height":[6,9,10,10,0],"texture":[8,9,9,4],"propeller":false},"midterm_exam":{"section_segments":6,"offset":{"x":7,"y":-70,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-80,-10,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,2,63,4],"propeller":false,"angle":0},"final_exam":{"section_segments":6,"offset":{"x":0,"y":-70,"z":4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-90,-15,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,4,63,4],"propeller":false,"angle":0,"laser":{"damage":[250,250],"rate":0.5,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0,"recoil":50}},"barre1":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-85},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barre2":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-105},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barre3":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":10,"z":-125},"position":{"x":[30,30,30,30,30,30],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[14,4,17,4]}},"wings":{"shield":{"offset":{"x":0,"y":-30,"z":-1},"length":[25,13,32,25],"width":[50,80,70,40,20],"angle":[-40,0,90,190],"position":[0,-40,-40,-10,15],"texture":[12,63,8,2],"doubleside":true,"bump":{"position":30,"size":10}},"winglets":{"offset":{"x":10,"y":70,"z":0},"length":[50],"width":[50,20],"angle":[20],"position":[0,0],"texture":[3],"doubleside":true,"bump":{"position":-21,"size":15}},"sir_no_talks_in_library":{"offset":{"x":12,"y":30,"z":-10},"length":[20,25],"width":[120,90,50],"angle":[0,-20],"position":[0,0,20],"texture":[13,1],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Synthesis S1","level":7,"model":91,"code":791,"specs":{"shield":{"capacity":[320,320],"reload":[10,10]},"generator":{"capacity":[250,250],"reload":[0.001,0.001]},"ship":{"mass":300,"speed":[118,118],"rotation":[80,80],"acceleration":[120,120]}},"shape":[4.483,4.216,3.116,2.96,2.349,1.965,1.667,1.255,1.122,1.116,1.106,1.128,1.139,1.241,1.386,1.6,1.773,1.915,2.129,2.501,2.75,2.708,3.939,3.95,3.958,4.243,4.504,4.644,4.706,4.67,4.585,4.376,4.009,3.483,2.261,1.6,1.386,1.241,1.139,1.128,1.106,1.116,1.122,1.255,1.667,1.965,2.349,2.96,3.116,4.216],"lasers":[{"x":0,"y":-4.48,"z":0.112,"angle":0,"damage":[250,250],"rate":0.5,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":50}],"radius":4.706}}',
            stage2: '{"name":"Synthesis S2","designer":"nex","level":7,"model":92,"size":1.4,"specs":{"shield":{"capacity":[320,320],"reload":[15,15]},"generator":{"capacity":[250,250],"reload":[4000,4000]},"ship":{"mass":300,"speed":[118,118],"rotation":[80,80],"acceleration":[120,120]}},"bodies":{"THE__ONE__PIEEEEECE":{"section_segments":7,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-85,-90,-60,-70,-30,10,40,60,80,120,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,16,16,18,20,28,27,20,20,20,0],"height":[0,10,10,10,10,15,15,10,10,10,0],"texture":[49,1,2,63,1,10,4,13,8,17],"propeller":true},"is_one_piece":{"section_segments":16,"offset":{"x":0,"y":-18,"z":-95},"position":{"x":[-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40],"y":[0,0,0,0,0,17,15,22,18,13,5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,45,65,52.5,40,30,27,22,24,24],"height":[18,18,18,45,65,52.5,40,30,27,22,24,24],"texture":[4,3,13,3,63,49.5,12,18,17],"vertical":true,"angle":0},"the_best":{"section_segments":12,"offset":{"x":16,"y":3,"z":-45},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[35,35,20,20,20],"height":[35,35,20,20,20],"texture":[63],"vertical":true},"anime_of_all_times":{"section_segments":12,"offset":{"x":0,"y":-5,"z":5},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[40,40,30,30,30],"height":[30,30,20,20,20],"texture":[63],"vertical":true},"best_anime_ever":{"section_segments":6,"offset":{"x":0,"y":45,"z":5.7},"position":{"x":[0,0,0,0,0],"y":[-95,-55,-30,-10,15],"z":[0,0,0,0,10]},"width":[6,9,17,17,0],"height":[6,9,10,10,0],"texture":[8,9,9,4],"propeller":false},"midterm_exam":{"section_segments":6,"offset":{"x":0,"y":-70,"z":-7},"position":{"x":[-7,-7,-7,-7,-7,-7,-7,-7],"y":[-50,-80,-10,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,2,63,4],"propeller":false,"angle":0,"laser":{"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0,"recoil":50}},"midterm_exam2":{"section_segments":6,"offset":{"x":0,"y":-70,"z":-7},"position":{"x":[7,7,7,7,7,7,7,7],"y":[-50,-80,-10,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,2,63,4],"propeller":false,"angle":0},"final_exam":{"section_segments":6,"offset":{"x":0,"y":-70,"z":4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-90,-15,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,4,63,4],"propeller":false,"angle":0,"laser":{"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0,"recoil":50}},"barre1":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":0,"z":-85},"position":{"x":[20,20,20,20,20,20],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,63,4]},"barre2":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":10,"z":-105},"position":{"x":[30,30,30,30,30,30],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,17,4]},"barre3":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":10,"z":-125},"position":{"x":[30,30,30,30,30,30],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[14,4,17,4]}},"wings":{"shield":{"offset":{"x":0,"y":-30,"z":-1},"length":[25,13,32,25],"width":[50,80,70,40,20],"angle":[-40,0,90,190],"position":[0,-40,-40,-10,15],"texture":[12,63,8,2],"doubleside":true,"bump":{"position":30,"size":10}},"winglets":{"offset":{"x":10,"y":70,"z":0},"length":[50],"width":[50,20],"angle":[20],"position":[0,0],"texture":[3],"doubleside":true,"bump":{"position":-21,"size":15}},"sir_no_talks_in_library":{"offset":{"x":12,"y":30,"z":-10},"length":[20,25],"width":[120,90,50],"angle":[0,-20],"position":[0,0,20],"texture":[13,1],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Synthesis S2","level":7,"model":92,"code":792,"specs":{"shield":{"capacity":[320,320],"reload":[15,15]},"generator":{"capacity":[250,250],"reload":[4000,4000]},"ship":{"mass":300,"speed":[118,118],"rotation":[80,80],"acceleration":[120,120]}},"shape":[4.483,4.216,3.116,2.96,2.349,1.965,1.667,1.255,1.122,1.116,1.106,1.128,1.139,1.241,1.386,1.6,1.773,1.915,2.129,2.501,2.75,3.256,3.939,3.95,3.958,4.243,4.504,4.644,4.706,4.67,4.585,4.376,4.009,3.483,2.261,1.6,1.386,1.241,1.139,1.128,1.106,1.116,1.122,1.255,1.667,1.965,2.349,2.96,3.116,4.216],"lasers":[{"x":-0.196,"y":-4.2,"z":-0.196,"angle":0,"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":0,"y":-4.48,"z":0.112,"angle":0,"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":50}],"radius":4.706}}',
            stage3: '{"name":"Synthesis S3","designer":"nex","level":7,"model":93,"size":1.4,"specs":{"shield":{"capacity":[320,320],"reload":[20,20]},"generator":{"capacity":[250,250],"reload":[4000,4000]},"ship":{"mass":400,"speed":[125,125],"rotation":[80,80],"acceleration":[120,120]}},"bodies":{"THE__ONE__PIEEEEECE":{"section_segments":7,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-85,-90,-60,-70,-30,10,40,60,80,120,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,16,16,18,20,28,27,20,20,20,0],"height":[0,10,10,10,10,15,15,10,10,10,0],"texture":[49,1,2,63,1,10,4,13,8,17],"propeller":true},"is_one_piece":{"section_segments":16,"offset":{"x":0,"y":-18,"z":-95},"position":{"x":[-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40],"y":[0,0,0,0,0,17,15,22,18,13,5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,45,65,52.5,40,30,27,22,24,24],"height":[18,18,18,45,65,52.5,40,30,27,22,24,24],"texture":[4,3,13,3,63,49.5,12,18,17],"vertical":true,"angle":0},"the_best":{"section_segments":12,"offset":{"x":16,"y":3,"z":-45},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[35,35,20,20,20],"height":[35,35,20,20,20],"texture":[63],"vertical":true},"anime_of_all_times":{"section_segments":12,"offset":{"x":0,"y":-5,"z":5},"position":{"x":[0,0,0,0,0],"y":[-3,-3,6,-3,-5],"z":[0,0,0,0,0]},"width":[40,40,30,30,30],"height":[30,30,20,20,20],"texture":[63],"vertical":true},"best_anime_ever":{"section_segments":6,"offset":{"x":0,"y":45,"z":5.7},"position":{"x":[0,0,0,0,0],"y":[-95,-55,-30,-10,15],"z":[0,0,0,0,10]},"width":[6,9,17,17,0],"height":[6,9,10,10,0],"texture":[8,5,5,4],"propeller":false},"midterm_exam":{"section_segments":6,"offset":{"x":0,"y":-70,"z":-7},"position":{"x":[-7,-7,-7,-7,-7,-7,-7,-7],"y":[-50,-80,-10,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,2,63,4],"propeller":false,"angle":0,"laser":{"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0,"recoil":50}},"midterm_exam2":{"section_segments":6,"offset":{"x":0,"y":-70,"z":-7},"position":{"x":[7,7,7,7,7,7,7,7],"y":[-50,-80,-10,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,2,63,4],"propeller":false,"angle":0,"laser":{"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0,"recoil":50}},"final_exam":{"section_segments":6,"offset":{"x":0,"y":-70,"z":4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-90,-15,0,10,20,40,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,8,8,0],"height":[0,7,8,8,6,8,8,0],"texture":[49,4,63,4],"propeller":false,"angle":0,"laser":{"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"error":0,"angle":0,"recoil":50}},"barre1":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":10,"z":-85},"position":{"x":[30,30,30,30,30,30],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,17,4]},"barre2":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":10,"z":-105},"position":{"x":[30,30,30,30,30,30],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[4,4,17,4]},"barre3":{"section_segments":8,"vertical":1,"offset":{"x":0,"y":10,"z":-125},"position":{"x":[30,30,30,30,30,30],"y":[-15,-15,-10,30,35,35],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,10,10,5,0],"angle":30,"texture":[14,4,17,4]}},"wings":{"shield":{"offset":{"x":0,"y":-30,"z":-1},"length":[25,13,32,25],"width":[50,80,70,40,20],"angle":[-40,0,90,190],"position":[0,-40,-40,-10,15],"texture":[12,63,8,2],"doubleside":true,"bump":{"position":30,"size":10}},"winglets":{"offset":{"x":10,"y":70,"z":0},"length":[50],"width":[50,20],"angle":[20],"position":[0,0],"texture":[3],"doubleside":true,"bump":{"position":-21,"size":15}},"sir_no_talks_in_library":{"offset":{"x":12,"y":30,"z":-10},"length":[20,25],"width":[120,90,50],"angle":[0,-20],"position":[0,0,20],"texture":[13,1],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Synthesis S3","level":7,"model":93,"code":793,"specs":{"shield":{"capacity":[320,320],"reload":[20,20]},"generator":{"capacity":[250,250],"reload":[4000,4000]},"ship":{"mass":400,"speed":[125,125],"rotation":[80,80],"acceleration":[120,120]}},"shape":[4.483,4.216,3.116,2.96,2.349,1.965,1.667,1.255,1.122,1.116,1.106,1.128,1.139,1.241,1.386,1.6,1.773,1.915,2.129,2.501,2.75,3.256,3.939,3.95,3.958,4.243,4.504,4.644,4.706,4.67,4.585,4.376,4.009,3.483,2.261,1.6,1.386,1.241,1.139,1.128,1.106,1.116,1.122,1.255,1.667,1.965,2.349,2.96,3.116,4.216],"lasers":[{"x":-0.196,"y":-4.2,"z":-0.196,"angle":0,"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":0.196,"y":-4.2,"z":-0.196,"angle":0,"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":0,"y":-4.48,"z":0.112,"angle":0,"damage":[250,250],"rate":0.01,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":50}],"radius":4.706}}'
        },
        name: "Bloodthirst",
        duration: 3.5 * 60,
        endOnDeath: true,

        useRequirementsTextWhenReady: true,

        stagesText: [
            "Kill!",
            "More!",
            "MOREEE!!",
            "ACCQUIRED"
        ],

        stageValue: function (ship) {
            return Math.max(Math.min(this.stagesText.length - 1, Math.trunc(ship.custom.abilityCustom.kills)), 0) || 0;
        },

        initialize: function (ship) {
            ship.custom.abilityCustom.kills = 0;
        },

        canStart: function (ship) {
            return ship.custom.abilityCustom.kills > 0;
        },

        requirementsText: function (ship) {
            return this.stagesText[this.stageValue(ship)];
        },

        start: function (ship) {
            ship.set({
                type: this.codes['stage' + this.stageValue(ship)],
                stats: AbilityManager.maxStats,
                generator: 250
            });
            this.unload(ship);
        },

        event: function (event, ship) {
            if (event.name == "ship_destroyed") {
                if (event.killer === ship && !ship.custom.inAbility) ship.custom.abilityCustom.kills = (ship.custom.abilityCustom.kills || 0) + 1;
                if (event.ship === ship) ship.custom.abilityCustom.kills = 0;
            }
        },

        reload: function (ship) {
            ++ship.custom.abilityCustom.kills
        },

        unload: function (ship) {
            ship.custom.abilityCustom.kills = 0;
        }
    },
    "Thunder": {
        models: {
            default: '{"name":"Thunder","designer":"nex","level":6,"model":31,"size":1.67,"specs":{"shield":{"capacity":[320,320],"reload":[8,8]},"generator":{"capacity":[160,160],"reload":[50,50]},"ship":{"mass":375,"speed":[130,130],"rotation":[85,85],"acceleration":[95,96]}},"bodies":{"train_main":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-90,-70,-40,0,40,60,100,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,17,17,17,20,20,24,20,0],"height":[0,15,15,17,17,20,30,20,0],"texture":[111,2,10,8,10,4,1,17],"propeller":true},"cockpit_SUPPORT":{"section_segments":6,"offset":{"x":0,"y":65,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-35,-41,-30,-10,0,10,30,20],"z":[0,0,0,0,0,5,5,5]},"width":[0,15,15,15,10,15,15,0],"height":[0,14,15,15,10,15,15,0],"texture":[4,3,8,4,4,2,4],"propeller":false},"arms":{"section_segments":[45,135,225,315],"offset":{"x":31,"y":-25,"z":-4},"position":{"x":[0,0,0,0,-5,0,10,0],"y":[-75,-80,-60,-30,0,30,60,80],"z":[0,0,0,0,0,0,0,0]},"width":[0,10,10,12,13,13,16,0],"height":[0,19,20,22,24,24,24,0],"texture":[6,13,11,63,8,4],"propeller":false,"angle":0,"laser":{"damage":[15,15],"rate":5,"type":1,"speed":[110,110],"number":1,"error":0,"angle":0,"recoil":0}},"fists":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":37,"y":100,"z":6},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-75,-80,-60,-40,-30,-20,0,40,30],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,17,20,20,10,20,20,20,0],"height":[0,20,24,24,18,24,24,24,0],"texture":[4,2,10,4,4,63,15,17],"propeller":true}},"wings":{"diamond_plow":{"offset":{"x":0,"y":-100,"z":-17},"length":[25,25],"width":[50,40,30],"angle":[0,0],"position":[0,0,30],"texture":[8,1],"doubleside":false,"bump":{"position":60,"size":90}},"ridge_1":{"offset":{"x":0,"y":-100,"z":-12},"length":[20,0],"width":[60,0],"angle":[40],"position":[0,20],"texture":[63],"doubleside":false,"bump":{"position":60,"size":86}},"ridge_23":{"offset":{"x":18,"y":-100,"z":-12},"length":[0,22,0],"width":[0,60,0],"angle":[0,0],"position":[0,0,20],"texture":[63],"doubleside":false,"bump":{"position":60,"size":86}},"choochoo":{"offset":{"x":5,"y":20,"z":-12},"length":[40,20],"width":[60,60,30],"angle":[0,0],"position":[-40,0,20],"texture":[4,63],"doubleside":true,"bump":{"position":0,"size":22}},"winglets_mid":{"offset":{"x":35,"y":56,"z":23},"length":[0,35],"width":[0,80,40],"angle":[0,80],"position":[0,0,50],"texture":[4],"doubleside":true,"bump":{"position":0,"size":10}},"winglets_back":{"offset":{"x":50,"y":85,"z":15},"length":[0,30],"width":[0,60,30],"angle":[0,60],"position":[0,0,50],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}},"wings_are_better_than_bodies_proof":{"offset":{"x":0,"y":15,"z":14},"length":[15,-2,20],"width":[40,30,70,0],"angle":[-10,0,0],"position":[-5,0,0,20],"texture":[9,7,4],"doubleside":true,"bump":{"position":5,"size":30}},"exactly":{"offset":{"x":0,"y":20,"z":26.5},"length":[15],"width":[20,15],"angle":[-23],"position":[-5,0],"texture":[9,7,4],"doubleside":true,"bump":{"position":5,"size":5}}},"typespec":{"name":"Thunder","level":6,"model":31,"code":631,"specs":{"shield":{"capacity":[320,320],"reload":[8,8]},"generator":{"capacity":[160,160],"reload":[50,50]},"ship":{"mass":375,"speed":[130,130],"rotation":[85,85],"acceleration":[95,96]}},"shape":[4.342,4.383,4.094,3.737,3.448,3.114,2.619,1.666,1.456,1.415,1.5,1.59,1.69,1.838,2.048,2.333,2.474,2.683,2.844,2.699,3.644,5.095,5.46,4.914,4.76,3.681,4.76,4.914,5.46,5.095,3.644,2.699,2.844,2.683,2.474,2.333,2.048,1.838,1.69,1.59,1.5,1.415,1.456,1.666,2.619,3.114,3.448,3.737,4.094,4.383],"lasers":[{"x":1.035,"y":-3.507,"z":-0.134,"angle":0,"damage":[15,15],"rate":5,"type":1,"speed":[110,110],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.035,"y":-3.507,"z":-0.134,"angle":0,"damage":[15,15],"rate":5,"type":1,"speed":[110,110],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.46}}',
            ability: '{"name":"Thunder","designer":"nex","level":7,"model":31,"size":1.69,"specs":{"shield":{"capacity":[1000,1000],"reload":[10,10]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":1250,"speed":[0.1,0.1],"rotation":[2,2],"acceleration":[70,70]}},"bodies":{"train_main":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-90,-70,-40,0,40,60,100,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,17,17,17,20,20,24,45,0],"height":[0,15,15,17,17,20,30,20,0],"texture":[111,2,10,8,10,4,17,49],"propeller":true},"cockpit_SUPPORT":{"section_segments":6,"offset":{"x":0,"y":65,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-35,-41,-30,-10,0,10,30,20],"z":[0,0,0,0,0,5,5,5]},"width":[0,15,15,15,10,15,15,0],"height":[0,14,15,15,10,15,15,0],"texture":[4,3,8,4,4,2,4],"propeller":false},"arms":{"section_segments":[45,135,225,315],"offset":{"x":31,"y":-25,"z":-4},"position":{"x":[0,0,0,0,-5,0,10,0],"y":[-75,-80,-60,-30,0,30,60,80],"z":[-10,-10,-10,-12,-10,0,0,0]},"width":[0,10,10,12,13,13,16,0],"height":[0,19,20,22,24,24,24,0],"texture":[6,13,11,63,8,4],"propeller":false,"angle":0},"fists":{"section_segments":[35,55,125,145,215,235,305,325,395],"offset":{"x":37,"y":100,"z":6},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-75,-80,-60,-40,-30,-20,0,40,30],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,17,20,20,10,20,20,20,0],"height":[0,20,24,24,18,24,24,24,0],"texture":[4,2,10,4,4,63,17,49],"propeller":true}},"wings":{"diamond_plow":{"offset":{"x":0,"y":-100,"z":-17},"length":[30,25,25],"width":[50,100,50,30],"angle":[0,0,0],"position":[0,0,0,30],"texture":[4,8,1],"doubleside":false,"bump":{"position":60,"size":70}},"thomas_is_leaving_he_has_seen_everything":{"offset":{"x":0,"y":-95,"z":-17},"length":[45],"width":[70,40],"angle":[0],"position":[0,0],"texture":[17,8,1],"doubleside":false,"bump":{"position":60,"size":80}},"er":{"offset":{"x":0,"y":-95,"z":-25},"length":[10,50],"width":[50,50,0],"angle":[-10,0],"position":[-50,-40,0],"texture":[4,2],"doubleside":false,"bump":{"position":60,"size":70}},"ridge_1":{"offset":{"x":25,"y":-120,"z":-18},"length":[0,22,0],"width":[0,90,0],"angle":[0,0],"position":[0,0,20],"texture":[63],"doubleside":false,"bump":{"position":60,"size":100}},"ridge_23":{"offset":{"x":55,"y":-110,"z":-18},"length":[0,16,0],"width":[0,70,0],"angle":[0,0],"position":[0,0,20],"texture":[63],"doubleside":false,"bump":{"position":60,"size":100}},"choochoo":{"offset":{"x":5,"y":20,"z":-12},"length":[40,20],"width":[60,60,30],"angle":[0,0],"position":[-40,0,20],"texture":[4,63],"doubleside":true,"bump":{"position":0,"size":22}},"winglets_mid":{"offset":{"x":35,"y":56,"z":23},"length":[0,35],"width":[0,80,40],"angle":[0,80],"position":[0,0,50],"texture":[4],"doubleside":true,"bump":{"position":0,"size":10}},"winglets_back":{"offset":{"x":50,"y":85,"z":15},"length":[0,30],"width":[0,60,30],"angle":[0,60],"position":[0,0,50],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}},"wings_are_better_than_bodies_proof":{"offset":{"x":0,"y":15,"z":14},"length":[15,-2,20],"width":[40,30,70,0],"angle":[-10,0,0],"position":[-5,0,0,20],"texture":[9,7,4],"doubleside":true,"bump":{"position":5,"size":30}},"exactly":{"offset":{"x":0,"y":20,"z":26.5},"length":[15],"width":[20,15],"angle":[-23],"position":[-5,0],"texture":[9,7,4],"doubleside":true,"bump":{"position":5,"size":5}}},"typespec":{"name":"Thunder","level":7,"model":31,"code":731,"specs":{"shield":{"capacity":[1000,1000],"reload":[10,10]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":1250,"speed":[0.1,0.1],"rotation":[2,2],"acceleration":[70,70]}},"shape":[5.746,5.641,5.253,5.242,4.762,4.226,4.018,3.709,3.34,1.432,1.518,1.609,1.71,1.86,2.072,2.361,2.503,2.715,2.878,2.731,3.687,5.156,5.526,4.973,4.817,3.725,4.817,4.973,5.526,5.156,3.687,2.731,2.878,2.715,2.503,2.361,2.072,1.86,1.71,1.609,1.518,1.432,3.34,3.709,4.018,4.226,4.762,5.242,5.253,5.641],"lasers":[],"radius":5.746}}'
        },
        name: "Choo choo",
        cooldown: 35 * 60,
        duration: 3 * 60,
        endOnDeath: true,
        
        bonkSpeed: 5,
        bonkInvulnerability: 3 * 60, // in ticks

        tickInterval: 1 * 60,

        start: function (ship) {
            ship.custom.abilityCustom.bonked = false;
            ship.set({type:this.codes.ability,stats:AbilityManager.maxStats,vx:0,vy:0});
        },

        tick: function (ship) {
            if (!ship.custom.abilityCustom.bonked) {
                HelperFunctions.accelerate(ship, this.bonkSpeed);
                ship.set({invulnerable: this.bonkInvulnerability});
                ship.custom.abilityCustom.bonked = true;
            }
        }
    },
    "Ghoul": {
        models: {
            default: '{"name":"Ghoul","designer":"nex","level":6,"model":32,"size":1.15,"specs":{"shield":{"capacity":[240,240],"reload":[14,14]},"generator":{"capacity":[220,220],"reload":[50,50]},"ship":{"mass":200,"speed":[120,120],"rotation":[85,85],"acceleration":[100,100]}},"bodies":{"spine":{"section_segments":8,"offset":{"x":0,"y":25,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-60,-55,-35,-10,20,50,60,80,90,100],"z":[0,0,0,0,0,-7,-7,-8,-8,-10]},"width":[0,15,23,25,18,13,10,10,5,0],"height":[0,5,8,10,7,7,5,3,1,0],"texture":[4,63,1,10,1],"propeller":false},"tentacles":{"section_segments":4,"offset":{"x":60,"y":-75,"z":-10},"position":{"x":[0,15,25,34,35,0,-15,-20,-20],"y":[-125,-100,-75,-35,20,50,80,140,130],"z":[-20,-10,-5,0,10,10,0,0,0]},"width":[0,7,10,15,30,20,25,15,0],"height":[0,7,10,15,30,20,25,15,0],"texture":[6,2,15,4,8,2,1],"propeller":false},"tentacles2":{"section_segments":6,"offset":{"x":30,"y":-45,"z":-34},"position":{"x":[0,15,25,34,35,0,-15,-20,-20],"y":[-125,-100,-75,-35,49,70,80,140,130],"z":[-20,-10,-5,0,-2,10,20,30,30]},"width":[0,7,10,15,30,20,25,15,0],"height":[0,7,10,15,30,20,25,15,0],"texture":[6,2,15,4,1],"propeller":false},"eye":{"section_segments":10,"offset":{"x":0,"y":-15,"z":-85},"position":{"x":[0,0,0,0,0,0],"y":[-31.5,-31.5,-31.5,-52.5,-47.25,-26.25],"z":[0,0,0,0,0,0]},"width":[0,10.5,21,52.5,63,63],"height":[0,10.5,21,26.25,31.5,42],"texture":[5,63,49,4,2],"propeller":false,"vertical":true,"angle":180},"uranium_crane":{"section_segments":5,"offset":{"x":0,"y":45,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-40,-20,0,30,70,90,70],"z":[0,0,0,0,0,0,0,0]},"width":[0,25,35,35,25,40,40,0],"height":[0,10,15,15,10,15,10,0],"texture":[4,4,3,1,63,4,13],"propeller":false,"laser":{"damage":[130,130],"rate":3,"type":2,"speed":[140,140],"number":1,"error":0,"angle":0,"recoil":0}},"growths":{"section_segments":8,"offset":{"x":60,"y":85,"z":20},"position":{"x":[-10,-10,-10,-10,0,0,0,0,0,0],"y":[-60,-55,-35,0,15,40,60,80,100,90],"z":[-10,-10,-10,-10,0,0,0,0,0,0]},"width":[0,15,31,31,20,20,30,30,27,0],"height":[0,10,15,15,10,15,25,25,15,0],"texture":[1,3,11,1,63,1,3,13,17],"propeller":true},"vein_1":{"section_segments":4,"offset":{"x":0,"y":-85,"z":10},"position":{"x":[75,70,40,20,15,15],"y":[50,80,100,120,150,160],"z":[5,-10,10,0,-5,0]},"width":[0,20,10,15,10,0],"height":[0,10,10,10,10,0],"texture":[6],"propeller":false},"vein_2":{"section_segments":4,"offset":{"x":0,"y":-25,"z":10},"position":{"x":[-120,-85,-70,-80,-40,-40],"y":[50,75,100,120,150,200],"z":[0,0,0,0,20,10]},"width":[0,8,14,15,15,0],"height":[0,8,10,10,10,0],"texture":[6],"propeller":false},"vein_3":{"section_segments":4,"offset":{"x":0,"y":15,"z":0},"position":{"x":[30,70,50,70,80,90],"y":[50,60,100,120,150,180],"z":[0,0,40,30,20,20]},"width":[0,13,17,10,10,0],"height":[0,10,10,10,10,0],"texture":[6],"propeller":false},"vein_4":{"section_segments":4,"offset":{"x":0,"y":-65,"z":10},"position":{"x":[100,90,80,80,60,70],"y":[50,70,90,120,150,180],"z":[40,20,20,0,0,0]},"width":[0,5,7,10,10,0],"height":[0,5,7,10,10,0],"texture":[6],"propeller":false},"vein_5":{"section_segments":4,"offset":{"x":0,"y":-145,"z":10},"position":{"x":[-100,-120,-90,-40,-50,-50],"y":[50,80,100,130,150,180],"z":[-9,0,-10,0,0,0]},"width":[0,10,30,15,10,0],"height":[0,10,10,10,10,0],"texture":[6],"propeller":false}},"wings":{"jaws":{"offset":{"x":32,"y":-40,"z":-10},"length":[-10,30],"width":[0,140,20],"angle":[0,0],"position":[0,20,20],"texture":[13,63],"doubleside":true,"bump":{"position":20,"size":22}},"winglets":{"offset":{"x":0,"y":55,"z":6},"length":[60],"width":[120,40],"angle":[10],"position":[0,80],"texture":[1],"doubleside":true,"bump":{"position":0,"size":5}},"teeth":{"offset":{"x":-26,"y":-35,"z":-2},"length":[15,-15,15],"width":[10,0,30,0],"angle":[0,0,0],"position":[0,0,5,-20],"texture":[49],"doubleside":true,"bump":{"position":0,"size":25}},"teeth2":{"offset":{"x":-26,"y":-65,"z":-10},"length":[15,-15,20],"width":[10,0,20,0],"angle":[0,0,0],"position":[0,0,0,-30],"texture":[49],"doubleside":true,"bump":{"position":0,"size":15}},"eyelashes_1":{"offset":{"x":16,"y":115,"z":-5},"length":[0,70],"width":[0,100,40],"angle":[80,80],"position":[0,0,80],"texture":[63],"doubleside":true,"bump":{"position":30,"size":12}},"eyelashes_2":{"offset":{"x":65,"y":95,"z":10},"length":[0,70],"width":[0,100,20],"angle":[60,60],"position":[0,0,60],"texture":[63],"doubleside":true,"bump":{"position":30,"size":12}}},"typespec":{"name":"Ghoul","level":6,"model":32,"code":632,"specs":{"shield":{"capacity":[240,240],"reload":[14,14]},"generator":{"capacity":[220,220],"reload":[50,50]},"ship":{"mass":200,"speed":[120,120],"rotation":[85,85],"acceleration":[100,100]}},"shape":[0.805,3.97,4.803,4.735,4.437,4.078,3.739,3.494,3.306,3.189,2.579,2.326,2.303,2.214,2.14,2.174,2.345,2.426,2.591,3.076,4.289,4.858,4.94,4.473,4.987,3.745,4.987,4.473,4.702,4.698,4.289,3.09,2.789,2.5,2.544,2.729,2.819,2.095,2.076,2.056,3.005,3.343,3.306,3.494,3.739,4.078,4.437,4.735,4.803,3.97],"lasers":[{"x":0,"y":-0.115,"z":0,"angle":0,"damage":[130,130],"rate":3,"type":2,"speed":[140,140],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.987}}',
            ability: '{"name":"Ghoul","designer":"nex","level":7,"model":32,"size":1.15,"specs":{"shield":{"capacity":[240,240],"reload":[34,34]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":220,"speed":[200,200],"rotation":[70,70],"acceleration":[70,70]}},"bodies":{"spine":{"section_segments":8,"offset":{"x":0,"y":25,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-60,-55,-35,-10,20,50,60,80,90,100],"z":[0,0,0,0,0,-7,-7,-8,-8,-10]},"width":[0,15,23,25,18,13,10,10,5,0],"height":[0,5,8,10,7,7,5,3,1,0],"texture":[4,63,1,10,1],"propeller":false},"tentacles":{"section_segments":4,"offset":{"x":60,"y":-55,"z":-10},"position":{"x":[5,40,50,45,50,10,-15,-20,-20],"y":[-125,-100,-75,-35,20,50,80,140,130],"z":[-20,-15,-5,0,10,-5,0,0,0]},"width":[0,7,10,15,30,20,25,15,0],"height":[0,7,10,15,30,20,25,15,0],"texture":[6,2,15,4,8,2,1],"propeller":false,"angle":-40},"tentacles2":{"section_segments":6,"offset":{"x":30,"y":-35,"z":-34},"position":{"x":[0,15,10,40,40,0,-15,-20,-20],"y":[-125,-100,-75,-35,49,70,80,140,130],"z":[-20,-10,-5,0,-2,10,20,30,30]},"width":[0,7,10,15,30,20,25,15,0],"height":[0,7,10,15,30,20,25,15,0],"texture":[6,2,15,4,1],"propeller":false,"angle":-25},"eye":{"section_segments":10,"offset":{"x":0,"y":-10,"z":-85},"position":{"x":[0,0,0,0,0,0],"y":[-31.5,-31.5,-31.5,-52.5,-47.25,0],"z":[0,0,0,0,0,0]},"width":[0,10.5,28.875,52.5,63,63],"height":[0,10.5,28.875,42,52.5,42],"texture":[17,5,49,4,2],"propeller":false,"vertical":true,"angle":180},"uranium_crane":{"section_segments":5,"offset":{"x":0,"y":45,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-40,-20,0,30,70,90,70],"z":[0,0,0,0,0,0,0,0]},"width":[0,25,35,35,25,40,40,0],"height":[0,10,15,15,10,15,10,0],"texture":[4,4,3,1,63,4,13],"propeller":false},"growths":{"section_segments":8,"offset":{"x":60,"y":85,"z":20},"position":{"x":[-10,-10,-10,-10,0,0,0,0,0,0],"y":[-60,-55,-35,0,15,40,60,80,100,90],"z":[-10,-10,-10,-10,0,0,0,0,0,0]},"width":[0,15,31,31,20,20,30,30,27,0],"height":[0,10,15,15,10,15,25,25,15,0],"texture":[1,3,11,1,63,1,3,13,17],"propeller":true},"vein_1":{"section_segments":4,"offset":{"x":0,"y":-85,"z":10},"position":{"x":[95,70,40,20,15,15],"y":[60,80,100,120,150,160],"z":[5,-10,10,0,-5,0]},"width":[0,20,10,15,10,0],"height":[0,10,10,10,10,0],"texture":[6],"propeller":false},"vein_2":{"section_segments":4,"offset":{"x":0,"y":-25,"z":10},"position":{"x":[-120,-85,-70,-80,-40,-40],"y":[50,75,100,120,150,200],"z":[0,0,0,0,20,10]},"width":[0,8,14,15,15,0],"height":[0,8,10,10,10,0],"texture":[6],"propeller":false},"vein_3":{"section_segments":4,"offset":{"x":0,"y":15,"z":0},"position":{"x":[30,70,50,70,80,90],"y":[50,60,100,120,150,180],"z":[0,0,40,30,20,20]},"width":[0,13,17,10,10,0],"height":[0,10,10,10,10,0],"texture":[6],"propeller":false},"vein_4":{"section_segments":4,"offset":{"x":0,"y":-65,"z":10},"position":{"x":[100,90,80,80,60,70],"y":[50,70,90,120,150,180],"z":[40,20,20,0,0,0]},"width":[0,5,7,10,10,0],"height":[0,5,7,10,10,0],"texture":[6],"propeller":false},"vein_5":{"section_segments":4,"offset":{"x":0,"y":-145,"z":10},"position":{"x":[-140,-150,-110,-60,-50,-50],"y":[50,80,120,130,150,180],"z":[-9,0,-10,-10,0,0]},"width":[0,10,20,15,10,0],"height":[0,10,10,10,10,0],"texture":[6],"propeller":false}},"wings":{"jaws":{"offset":{"x":40,"y":-40,"z":-10},"length":[-10,30],"width":[0,140,20],"angle":[0,0],"position":[0,20,20],"texture":[13,63],"doubleside":true,"bump":{"position":20,"size":22}},"winglets":{"offset":{"x":0,"y":55,"z":6},"length":[60],"width":[120,40],"angle":[10],"position":[0,80],"texture":[1],"doubleside":true,"bump":{"position":0,"size":5}},"teeth":{"offset":{"x":-33,"y":-35,"z":-2},"length":[15,-15,15],"width":[10,0,30,0],"angle":[0,0,0],"position":[0,0,5,-20],"texture":[49],"doubleside":true,"bump":{"position":0,"size":25}},"teeth2":{"offset":{"x":-32,"y":-65,"z":-10},"length":[15,-15,20],"width":[10,0,20,0],"angle":[0,0,0],"position":[0,0,0,-30],"texture":[49],"doubleside":true,"bump":{"position":0,"size":15}},"eyelashes_1":{"offset":{"x":16,"y":115,"z":-5},"length":[0,70],"width":[0,100,40],"angle":[80,80],"position":[0,0,80],"texture":[63],"doubleside":true,"bump":{"position":30,"size":12}},"eyelashes_2":{"offset":{"x":65,"y":95,"z":10},"length":[0,70],"width":[0,100,20],"angle":[60,60],"position":[0,0,60],"texture":[63],"doubleside":true,"bump":{"position":30,"size":12}}},"typespec":{"name":"Ghoul","level":7,"model":32,"code":732,"specs":{"shield":{"capacity":[240,240],"reload":[34,34]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":220,"speed":[200,200],"rotation":[70,70],"acceleration":[70,70]}},"shape":[0.805,2.202,2.103,2.182,3.907,3.697,4.745,4.649,4.437,4.119,3.413,2.949,2.736,2.591,2.14,2.174,2.345,2.426,2.591,3.076,4.289,4.858,4.94,4.473,4.987,3.745,4.987,4.473,4.702,4.698,4.289,3.09,2.789,2.5,2.544,2.729,2.819,2.591,2.736,3.263,3.913,4.119,4.437,4.649,4.745,3.697,3.907,2.182,2.103,2.202],"lasers":[],"radius":4.987}}'
        },
        name: "Replicate",
        cooldown: 40 * 60,
        duration: 3 * 60,

        range: 20,

        spreadAngle: 0.1,

        knockbackSpeed: 1.5,
        abilityInvulnerability: 2 * 60, // in ticks

        aliens: {
            lifespan: 5 * 60,
            amount: 10,
            dmg_per_level: 25,
            codes: [10],
            level: {
                min: 0,
                max: 2
            },
            repellingSpeed: 1 // how fast the alien will move far from the Ghoul upon creation
        },

        start: function (ship) {
            HelperFunctions.templates.start.call(this, ship);
            ship.set({ invulnerable: this.abilityInvulnerability});
            HelperFunctions.accelerate(ship, this.knockbackSpeed, ship.r - Math.PI);
            for (let i = 0; i < this.aliens.amount; ++i) {
                let angle = ship.r + (Math.random() * 2 - 1) * this.spreadAngle;
                let cosAngle = Math.cos(angle), sinAngle = Math.sin(angle);
                let alien = game.addAlien({
                    x: ship.x + this.range * cosAngle,
                    y: ship.y + this.range * sinAngle,
                    vx: this.aliens.repellingSpeed * cosAngle,
                    vy: this.aliens.repellingSpeed * sinAngle,
                    code: HelperFunctions.randomItem(this.aliens.codes).value,
                    level: HelperFunctions.randIntInRange(this.aliens.level.min, this.aliens.level.max + 1),
                    crystal_drop: 0,
                    points: 0
                });

                alien.custom.fromGhoulAbility = true;
                alien.custom.abilityEnd = game.step + this.aliens.lifespan;
            }
        },

        globalTick: function (game) {
            for (let alien of game.aliens) {
                if (!alien.custom.fromGhoulAbility || alien.id < 0) continue;
                if (!alien.custom.init) {
                    alien.set({
                        damage: this.aliens.dmg_per_level * (alien.level + 1),
                        rate: 1,
                        laser_speed: 200
                    });
                    alien.custom.init = true;
                }
                if (!alien.custom.killed && alien.custom.abilityEnd < game.step) {
                    alien.set({ kill: true });
                    alien.custom.killed = true;
                }
            }
        }
    },
    "Blunderbuss": {
        models: {
            default: '{"name":"Blunderbuss","designer":"nex","level":6,"model":33,"size":1.32,"specs":{"shield":{"capacity":[356,356],"reload":[8,8]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":300,"speed":[100,100],"rotation":[70,70],"acceleration":[160,160]}},"bodies":{"cannon":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-125,-130,-150,-130,-110,-80,0,0,0],"z":[0,0,0,0,0,0,10,0,0]},"width":[0,25,50,45,30,20,0,0,0],"height":[0,25,50,45,30,20,0,0,0],"texture":[17,18,63,4,11,2],"propeller":false,"angle":0,"laser":{"damage":[10,10],"rate":1,"type":2,"speed":[250,250],"number":20,"error":50,"angle":0,"recoil":20}},"main_body_ntocannon":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-70,-30,0,20,35,70,120,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,18,20,20,20,24,30,30,25,0],"height":[0,10,15,15,15,18,24,25,20,0],"texture":[1,3,1,10,2,63,8,13,17],"propeller":true,"laser":{"damage":[200,200],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"recoil":0}},"grenade_shel1":{"section_segments":8,"offset":{"x":0,"y":-95,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,1,63,4,4],"propeller":false,"angle":-90},"grenade_shel2":{"section_segments":8,"offset":{"x":0,"y":-120,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,1,63,4,4],"propeller":false,"angle":-90},"grenade_shel3":{"section_segments":8,"offset":{"x":0,"y":-145,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,1,63,4,4],"propeller":false,"angle":-90},"grenade_shel4":{"section_segments":8,"offset":{"x":0,"y":-170,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,1,63,4,4],"propeller":false,"angle":-90},"arm":{"section_segments":4,"offset":{"x":15,"y":0,"z":-12},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-120,-75,-50,-35,-20,40,80,70],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,16,20,25,10,24,25,18,0],"height":[0,16,18,18,10,18,18,18,0],"texture":[4,3,3,4,4,3],"propeller":false},"sidebooster":{"section_segments":8,"offset":{"x":0,"y":135,"z":-20},"position":{"x":[100,100,100,100,100,100,100,100,100,100],"y":[-120,-90,-100,-70,-50,-36,-20,0,40,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,17,20,20,15,30,30,25,0],"height":[0,10,17,20,20,15,25,25,20,0],"texture":[6,18,1,2,4,4,11,2,17],"propeller":true},"topbooster":{"section_segments":8,"offset":{"x":0,"y":135,"z":35},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-120,-90,-100,-70,-50,-36,-20,0,40,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,17,20,20,15,30,30,25,0],"height":[0,10,17,20,20,15,25,25,20,0],"texture":[6,18,1,2,4,4,11,10,17],"propeller":true},"cockpit_base":{"section_segments":4,"offset":{"x":0,"y":90,"z":-15},"position":{"x":[55,55,55,55,55,55,55,55,55],"y":[-75,-65,-45,-15,15,30,50,60,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,15,25,35,32,20,20,20,0],"height":[0,8,12,16,16,12,12,12,0],"texture":[4,3,10,2,4,13,8,12],"propeller":false},"cockpit":{"section_segments":0,"offset":{"x":0,"y":60,"z":-10},"position":{"x":[55,55,55,55,55],"y":[-35,-25,-10,15,30],"z":[0,0,0,0,0]},"width":[0,10,15,15,10],"height":[0,9,12,15,10],"texture":[4,9,9,3],"propeller":false},"wing":{"section_segments":4,"offset":{"x":0,"y":40,"z":-8},"position":{"x":[70,55,10],"y":[-140,-90,0],"z":[-30,-20,16]},"width":[10,30,60],"height":[0,5,9],"angle":-90,"texture":[63,11],"propeller":false},"wing2":{"section_segments":4,"offset":{"x":0,"y":30,"z":-20},"position":{"x":[-50,0,0],"y":[-80,-50,0],"z":[-20,-10,0]},"width":[15,50,80],"height":[0,10,15],"angle":90,"texture":[63,63],"propeller":false},"wing3":{"section_segments":0,"offset":{"x":0,"y":23,"z":-20},"position":{"x":[40,0,0],"y":[-95,-65,0],"z":[-30,-20,0]},"width":[20,40,60],"height":[0,10,15],"angle":90,"texture":[3,1,4],"propeller":false}},"wings":{"main":{"offset":{"x":15,"y":70,"z":0},"length":[50,30],"width":[120,55,30],"angle":[20,-10],"position":[-18,40,50],"texture":[18,8],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Blunderbuss","level":6,"model":33,"code":633,"specs":{"shield":{"capacity":[356,356],"reload":[8,8]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":300,"speed":[100,100],"rotation":[70,70],"acceleration":[160,160]}},"shape":[3.967,4.03,4.163,4.174,2.343,2.47,2.474,2.172,1.958,1.807,1.703,1.635,1.596,1.596,2.828,3.354,3.613,4.568,4.868,5.284,5.678,5.47,5.106,4.163,4.667,4.629,4.667,3.983,4.003,4.235,4.306,3.786,2.896,2.502,2.127,1.877,1.704,1.585,1.502,1.451,1.425,1.422,1.303,1.228,1.173,1.87,2.174,4.174,4.163,4.03],"lasers":[{"x":0,"y":-3.96,"z":0,"angle":0,"damage":[10,10],"rate":1,"type":2,"speed":[250,250],"number":20,"spread":0,"error":50,"recoil":20},{"x":0,"y":-2.64,"z":0,"angle":0,"damage":[200,200],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":5.678}}',
            ability: '{"name":"Blunderbuss","designer":"nex","idea":"bobis","level":7,"model":33,"size":1.32,"specs":{"shield":{"capacity":[356,356],"reload":[20,20]},"generator":{"capacity":[1500,1500],"reload":[300,300]},"ship":{"mass":300,"speed":[75,75],"rotation":[70,70],"acceleration":[130,130]}},"bodies":{"cannon":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-125,-130,-150,-130,-110,-80,0,0,0],"z":[0,0,0,0,0,0,10,0,0]},"width":[0,45,65,55,40,20,0,0,0],"height":[0,45,65,55,30,20,0,0,0],"texture":[17,18,17,4,11,2],"propeller":false,"angle":0,"laser":{"damage":[20,20],"rate":1,"type":2,"speed":[450,450],"number":75,"error":70,"angle":0,"recoil":10}},"main_body_ntocannon":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-70,-30,0,20,35,70,120,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,18,20,20,20,24,30,30,25,0],"height":[0,10,15,15,15,18,24,25,20,0],"texture":[1,3,1,10,2,63,8,13,17],"propeller":true,"laser":{"damage":[1500,1500],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"recoil":0}},"grenade_shel1":{"section_segments":8,"offset":{"x":0,"y":-95,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,17,63,4,4],"propeller":false,"angle":-90},"grenade_shel2":{"section_segments":8,"offset":{"x":0,"y":-120,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,17,63,4,4],"propeller":false,"angle":-90},"grenade_shel3":{"section_segments":8,"offset":{"x":0,"y":-145,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,17,63,4,4],"propeller":false,"angle":-90},"grenade_shel4":{"section_segments":8,"offset":{"x":0,"y":-170,"z":-34},"position":{"x":[110,110,110,110,110,110,110],"y":[-50,-53,-60,-50,-35,0,0,-20],"z":[0,0,0,0,0,20,30,30]},"width":[0,10,12,15,15,15,15,0],"height":[0,10,12,15,20,20,15,0],"texture":[4,18,63,17,63,4,4],"propeller":false,"angle":-90},"arm":{"section_segments":4,"offset":{"x":15,"y":0,"z":-12},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-120,-75,-50,-35,-20,40,80,70],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,16,20,25,10,24,25,18,0],"height":[0,16,18,18,10,18,18,18,0],"texture":[4,3,3,4,4,3],"propeller":false},"sidebooster":{"section_segments":8,"offset":{"x":0,"y":135,"z":-20},"position":{"x":[100,100,100,100,100,100,100,100,100,100],"y":[-120,-90,-100,-70,-50,-36,-20,0,40,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,17,20,20,15,30,30,25,0],"height":[0,10,17,20,20,15,25,25,20,0],"texture":[6,18,1,2,4,4,11,2,17],"propeller":true},"topbooster":{"section_segments":8,"offset":{"x":0,"y":135,"z":35},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-120,-90,-100,-70,-50,-36,-20,0,40,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,17,20,20,15,30,30,25,0],"height":[0,10,17,20,20,15,25,25,20,0],"texture":[6,18,1,2,4,4,11,10,17],"propeller":true},"cockpit_base":{"section_segments":4,"offset":{"x":0,"y":90,"z":-15},"position":{"x":[55,55,55,55,55,55,55,55,55],"y":[-75,-65,-45,-15,15,30,50,60,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,15,25,35,32,20,20,20,0],"height":[0,8,12,16,16,12,12,12,0],"texture":[4,3,10,2,4,13,8,12],"propeller":false},"cockpit":{"section_segments":0,"offset":{"x":0,"y":60,"z":-10},"position":{"x":[55,55,55,55,55],"y":[-35,-25,-10,15,30],"z":[0,0,0,0,0]},"width":[0,10,15,15,10],"height":[0,9,12,15,10],"texture":[4,9,9,3],"propeller":false},"wing":{"section_segments":4,"offset":{"x":0,"y":40,"z":-8},"position":{"x":[70,55,10],"y":[-140,-90,0],"z":[-30,-20,16]},"width":[10,30,60],"height":[0,5,9],"angle":-90,"texture":[63,11],"propeller":false},"wing2":{"section_segments":4,"offset":{"x":0,"y":30,"z":-20},"position":{"x":[-50,0,0],"y":[-80,-50,0],"z":[-20,-10,0]},"width":[15,50,80],"height":[0,10,15],"angle":90,"texture":[63,63],"propeller":false},"wing3":{"section_segments":0,"offset":{"x":0,"y":23,"z":-20},"position":{"x":[40,0,0],"y":[-95,-65,0],"z":[-30,-20,0]},"width":[20,40,60],"height":[0,10,15],"angle":90,"texture":[3,1,4],"propeller":false}},"wings":{"main":{"offset":{"x":15,"y":70,"z":0},"length":[50,30],"width":[120,55,30],"angle":[20,-10],"position":[-18,40,50],"texture":[18,8],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Blunderbuss","level":7,"model":33,"code":733,"specs":{"shield":{"capacity":[356,356],"reload":[20,20]},"generator":{"capacity":[1500,1500],"reload":[300,300]},"ship":{"mass":300,"speed":[75,75],"rotation":[70,70],"acceleration":[130,130]}},"shape":[3.967,4.031,4.163,4.316,2.343,2.47,2.474,2.172,1.958,1.807,1.703,1.635,1.596,1.596,2.828,3.354,3.613,4.568,4.868,5.284,5.678,5.47,5.106,4.163,4.667,4.629,4.667,3.983,4.003,4.235,4.306,3.786,2.896,2.502,2.127,1.877,1.704,1.585,1.502,1.451,1.425,1.422,1.303,1.228,1.173,1.87,2.174,4.316,4.163,4.031],"lasers":[{"x":0,"y":-3.96,"z":0,"angle":0,"damage":[20,20],"rate":1,"type":2,"speed":[450,450],"number":75,"spread":0,"error":70,"recoil":10},{"x":0,"y":-2.64,"z":0,"angle":0,"damage":[1500,1500],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":5.678}}'
        },
        name: "Dragon's Breath",
        cooldown: 25 * 60,
        duration: 7 * 60,
        endOnDeath: true,
        cooldownRestartOnEnd: true
    },
    "Viper": {
        models: {
            default: '{"name":"Viper","designer":"nex","level":6,"model":34,"size":1.36,"zoom":0.9,"specs":{"shield":{"capacity":[260,260],"reload":[6,6]},"generator":{"capacity":[80,80],"reload":[900,900]},"ship":{"mass":200,"speed":[140,140],"rotation":[55,55],"acceleration":[105,105]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-70,-65,-40,-20,0,30,70,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,14,18,20,24,25,25,0],"height":[0,4,9,11,13,14,10,0],"texture":[4,3,1,1,2,63,13],"propeller":false},"cockpit":{"section_segments":6,"offset":{"x":0,"y":25,"z":6},"position":{"x":[0,0,0,0,0,0],"y":[-105,-40,-20,-5,5,40],"z":[-1,0,1,0,0,0]},"width":[5,10,14,15,10,0],"height":[0,10,10,12,12,0],"texture":[63,9,9,9,4],"propeller":false},"biggest_nutritious_mac_ever":{"section_segments":[45,135,225,315],"offset":{"x":40,"y":75,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-70,-50,-55,-40,-15,-5,10,20,50,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,25,30,30,24,24,30,30,27,0],"height":[0,6,10,15,20,10,10,20,20,15,0],"texture":[6,13,2,4,13,11,13,4,8,17],"propeller":true},"milky_way":{"section_segments":4,"offset":{"x":30,"y":-65,"z":-12},"position":{"x":[0,0,0,0,0,0,-5,0],"y":[-55,-60,-45,-30,-10,10,30,20],"z":[0,0,0,0,0,0,0,0]},"width":[0,8,10,15,18,15,10,0],"height":[0,8,10,15,18,15,10,0],"texture":[4,2,1,1,63,3],"propeller":false},"vegeta":{"section_segments":4,"offset":{"x":35,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-55,-60,-45,-30,-10,10,30,20],"z":[0,0,0,0,0,0,0,0]},"width":[0,8,12,18,25,15,10,0],"height":[0,8,10,15,18,15,10,0],"texture":[4,2,1,1,4,1],"propeller":true},"barrels_top":{"section_segments":4,"offset":{"x":20,"y":-45,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-100,-80,-70,-50,-40,20,30,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,6,6,9,9,7,7,10,10],"height":[0,6,6,9,9,7,7,10,10],"texture":[17,2,3,1,3,4,3,4],"propeller":0,"angle":0,"laser":{"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"error":5,"angle":0,"recoil":100}},"barrels_mid":{"section_segments":4,"offset":{"x":15,"y":-50,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-100,-80,-70,-50,-40,20,30,90],"z":[0,0,0,0,0,0,0,5,10]},"width":[0,6,6,9,9,7,7,10,10],"height":[0,6,6,9,9,7,7,10,10],"texture":[17,3,3,1,3,4,3,4],"propeller":0,"angle":0,"laser":{"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"error":5,"angle":0,"recoil":100}},"barrels_bot":{"section_segments":4,"offset":{"x":10,"y":-55,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-100,-80,-70,-50,-40,20,30,90],"z":[0,0,0,0,0,0,0,5,40]},"width":[0,6,6,9,9,7,7,10,10],"height":[0,6,6,9,9,7,7,10,10],"texture":[17,4,3,1,3,4,3,4],"propeller":0,"angle":0,"laser":{"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"error":5,"angle":0,"recoil":100}}},"wings":{"main":{"offset":{"x":0,"y":75,"z":18},"length":[55,0,35],"width":[60,60,90,30],"angle":[-10,0,0],"position":[0,0,0,20],"texture":[18,4,63],"doubleside":true,"bump":{"position":20,"size":10}},"winglets":{"offset":{"x":30,"y":-75,"z":-15},"length":[40],"width":[60,20],"angle":[0],"position":[-10,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":10}},"connector":{"offset":{"x":20,"y":-75,"z":0},"length":[0,40],"width":[0,40,40],"angle":[0,-90],"position":[0,0,-60],"texture":[16],"doubleside":true,"bump":{"position":0,"size":10}},"connector2":{"offset":{"x":20,"y":-15,"z":0},"length":[0,40],"width":[0,40,40],"angle":[0,-90],"position":[0,0,-60],"texture":[16],"doubleside":true,"bump":{"position":0,"size":10}}},"typespec":{"name":"Viper","level":6,"model":34,"code":634,"specs":{"shield":{"capacity":[260,260],"reload":[6,6]},"generator":{"capacity":[80,80],"reload":[900,900]},"ship":{"mass":200,"speed":[140,140],"rotation":[55,55],"acceleration":[105,105]}},"shape":[4.224,4.251,3.772,3.408,3.054,3.001,2.987,2.609,0.952,0.919,1.093,1.211,1.241,1.298,1.407,1.707,1.887,2.268,3.325,3.801,3.851,3.885,4.512,4.433,4.291,2.861,4.291,4.433,4.512,3.885,3.851,3.801,3.325,2.268,1.887,1.707,1.407,1.298,1.241,1.211,1.093,0.919,0.952,2.609,2.987,3.001,3.054,3.408,3.772,4.251],"lasers":[{"x":0.544,"y":-3.944,"z":0,"angle":0,"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"spread":0,"error":5,"recoil":100},{"x":-0.544,"y":-3.944,"z":0,"angle":0,"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"spread":0,"error":5,"recoil":100},{"x":0.408,"y":-4.08,"z":-0.408,"angle":0,"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"spread":0,"error":5,"recoil":100},{"x":-0.408,"y":-4.08,"z":-0.408,"angle":0,"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"spread":0,"error":5,"recoil":100},{"x":0.272,"y":-4.216,"z":-0.816,"angle":0,"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"spread":0,"error":5,"recoil":100},{"x":-0.272,"y":-4.216,"z":-0.816,"angle":0,"damage":[80,80],"rate":0.1666666,"type":1,"speed":[90,90],"number":1,"spread":0,"error":5,"recoil":100}],"radius":4.512}}'
        },
        name: "Almighty Push",
        cooldown: 24 * 60,
        duration: 1,
        endOnDeath: true,

        range: 69,
        showAbilityRangeUI: true,
        
        pushStrength: 1.69,

        generatorInit: 0,

        start: function (ship) {
            ship.set({invulnerable: 100});
            let targets = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true, aliens: true, asteroids: true }, true);
            for (let target of targets) {
                HelperFunctions.accelerateToTarget(target, ship, this.pushStrength, true);
            }
        },
        end: function () {}
    },
    "Valkyrie": {
        models: {
            default: '{"name":"Valkyrie","designer":"nex","level":6,"model":35,"size":1.15,"specs":{"shield":{"capacity":[200,200],"reload":[6,6]},"generator":{"capacity":[120,120],"reload":[90,90]},"ship":{"mass":160,"speed":[110,110],"rotation":[130,130],"acceleration":[180,180]}},"bodies":{"chin":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-57,-30,-5,20,60,110,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,25,27,20,30,20,0],"height":[0,10,15,15,10,15,10,0],"texture":[1,2,11,4,3,8,17],"propeller":true},"shield":{"section_segments":4,"offset":{"x":0,"y":-60,"z":0},"position":{"x":[-25,-20,0,0,-20,-25],"y":[-70,-60,-20,20,60,70],"z":[0,0,0,0,0,0]},"width":[0,10,17,17,10,0],"height":[0,20,24,24,20,0],"texture":[1,4,8,4,1],"propeller":true,"angle":90},"plate":{"section_segments":12,"offset":{"x":0,"y":-20,"z":-55},"position":{"x":[0,0,0,0,0],"y":[-40,-40,-30,-10,0],"z":[0,0,0,0,0]},"width":[0,35,45,0,0],"height":[0,35,45,0,0],"texture":[1,4],"propeller":false,"vertical":true,"angle":180},"plus_sign":{"section_segments":6,"offset":{"x":0,"y":30,"z":21},"position":{"x":[0,0,0,0],"y":[-55,-50,0,5],"z":[0,0,0,0]},"width":[5,8,8,5],"height":[0,0,0,0],"texture":[62],"propeller":false,"vertical":false,"angle":180},"plus_sign2":{"section_segments":6,"offset":{"x":0,"y":55,"z":21},"position":{"x":[0,0,0,0],"y":[-30,-25,25,30],"z":[0,0,0,0]},"width":[5,8,8,5],"height":[0,0,0,0],"texture":[62],"propeller":false,"vertical":false,"angle":90},"wing_base":{"section_segments":4,"offset":{"x":120,"y":115,"z":10},"position":{"x":[0,0,-15,-25,-10,5,10],"y":[-130,-95,-70,-40,0,30,35],"z":[0,0,10,30,40,40,40]},"width":[0,10,11,17,12,10,0],"height":[0,10,10,13,10,7,0],"texture":[4,3,2,1,-1],"propeller":false,"angle":45},"healinglaser":{"section_segments":8,"offset":{"x":20,"y":-60,"z":0},"position":{"x":[-10,-8,0,5,5,5,5,20],"y":[-95,-70,-50,-40,-20,-10,60,110],"z":[-15,-10,-10,-10,-10,-5,0,0]},"width":[0,4,6,7,7,5,10,5],"height":[0,4,6,7,7,5,5,5],"texture":[-1,13,4,8,1,1,3],"propeller":false,"angle":0,"laser":{"damage":[10,10],"rate":5,"type":1,"speed":[80,80],"number":1,"error":0,"angle":0,"recoil":0}},"healinglaser4":{"section_segments":8,"offset":{"x":25,"y":-60,"z":0},"position":{"x":[-10],"y":[-95],"z":[-15]},"width":[0],"height":[0],"texture":[-1],"propeller":false,"angle":5,"laser":{"damage":[10,10],"rate":5,"type":1,"speed":[100,100],"number":1,"error":0,"angle":0,"recoil":0}},"healinglaser2":{"section_segments":8,"offset":{"x":0,"y":-50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-95,-70,-50,-40,-20,-10,60,140],"z":[-10,-10,-10,-10,-10,-5,0,0]},"width":[0,4,5,7,7,5,10,5],"height":[0,4,5,7,7,5,5,5],"texture":[-1,13,4,8],"propeller":false,"angle":0,"laser":{"damage":[80,80],"rate":3,"type":2,"speed":[130,130],"number":1,"error":0,"angle":0,"recoil":0}}},"wings":{"main":{"offset":{"x":20,"y":90,"z":-5},"length":[35,-15,40],"width":[30,40,160,90],"angle":[0,0,-30],"position":[-10,-20,-40,-10],"texture":[4,13,63],"doubleside":true,"bump":{"position":20,"size":15}},"fang1":{"offset":{"x":18,"y":-95,"z":-8},"length":[-10,25],"width":[0,90,100],"angle":[-20,-20],"position":[0,15,0],"texture":[13,63],"doubleside":true,"bump":{"position":20,"size":30}},"fang2":{"offset":{"x":35,"y":-75,"z":-10},"length":[-10,15,15],"width":[0,40,60,0],"angle":[0,0,30],"position":[0,10,0,30],"texture":[13,3,63],"doubleside":true,"bump":{"position":20,"size":20}},"feather1":{"offset":{"x":75,"y":100,"z":30},"length":[100,10],"width":[40,20,0],"angle":[13,9],"position":[0,30,35],"texture":[49,1],"doubleside":true,"bump":{"position":20,"size":15}},"feather2":{"offset":{"x":60,"y":80,"z":17},"length":[110,10],"width":[40,20,0],"angle":[10,10],"position":[0,10,20],"texture":[49,1],"doubleside":true,"bump":{"position":20,"size":15}},"feather3":{"offset":{"x":62,"y":70,"z":11},"length":[83,10],"width":[40,20,0],"angle":[10,10],"position":[0,-10,-13],"texture":[49,1],"doubleside":true,"bump":{"position":20,"size":15}},"feather4":{"offset":{"x":60,"y":45,"z":5},"length":[60,10],"width":[40,20,0],"angle":[5,5],"position":[10,-12,-15],"texture":[49,1],"doubleside":true,"bump":{"position":20,"size":15}},"cockpit":{"offset":{"x":0,"y":-15,"z":13.5},"length":[12,10],"width":[46,30,0],"angle":[-7,-20],"position":[0,0,10],"texture":[9,4],"doubleside":true,"bump":{"position":30,"size":16}},"cockpit_top":{"offset":{"x":0,"y":5,"z":20},"length":[12,20],"width":[30,30,70],"angle":[0,-53],"position":[0,0,15],"texture":[13,4],"doubleside":true,"bump":{"position":30,"size":10}}},"typespec":{"name":"Valkyrie","level":6,"model":35,"code":635,"specs":{"shield":{"capacity":[200,200],"reload":[6,6]},"generator":{"capacity":[120,120],"reload":[90,90]},"ship":{"mass":160,"speed":[110,110],"rotation":[130,130],"acceleration":[180,180]}},"shape":[3.335,3.572,3.416,2.584,2.319,1.999,1.793,1.796,1.793,1.8,1.167,1.21,1.287,1.384,3.063,3.768,4.636,5.09,5.218,4.573,3.929,3.349,3.231,3.136,2.571,2.535,2.571,3.136,3.231,3.349,3.929,4.573,5.218,5.09,4.636,3.768,3.063,1.384,1.287,1.21,1.167,1.8,1.793,1.796,1.793,1.999,2.319,2.584,3.416,3.572],"lasers":[{"x":0.23,"y":-3.565,"z":0,"angle":0,"damage":[10,10],"rate":5,"type":1,"speed":[80,80],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.23,"y":-3.565,"z":0,"angle":0,"damage":[10,10],"rate":5,"type":1,"speed":[80,80],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.155,"y":-3.537,"z":0,"angle":5,"damage":[10,10],"rate":5,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.155,"y":-3.537,"z":0,"angle":-5,"damage":[10,10],"rate":5,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-3.335,"z":0,"angle":0,"damage":[80,80],"rate":3,"type":2,"speed":[130,130],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.218}}',
            ability: '{"name":"Valkyrie","designer":"nex","level":7,"model":35,"size":1.12,"specs":{"shield":{"capacity":[260,260],"reload":[12,12]},"generator":{"capacity":[160,160],"reload":[55,55]},"ship":{"mass":225,"speed":[160,160],"rotation":[70,70],"acceleration":[140,140]}},"bodies":{"chin":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-57,-30,-5,20,60,110,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,25,27,20,30,20,0],"height":[0,10,15,15,10,15,10,0],"texture":[1,2,11,4,3,8,17],"propeller":true},"shield":{"section_segments":4,"offset":{"x":0,"y":-60,"z":0},"position":{"x":[-25,-20,0,0,-20,-25],"y":[-70,-60,-20,20,60,70],"z":[0,0,0,0,0,0]},"width":[0,10,17,17,10,0],"height":[0,20,24,24,20,0],"texture":[1,4,8,4,1],"propeller":true,"angle":90},"plate":{"section_segments":12,"offset":{"x":0,"y":-20,"z":-55},"position":{"x":[0,0,0,0,0],"y":[-40,-40,-30,-10,0],"z":[0,0,0,0,0]},"width":[0,35,45,0,0],"height":[0,35,45,0,0],"texture":[1,4],"propeller":false,"vertical":true,"angle":180},"cross_sign":{"section_segments":6,"offset":{"x":0.1,"y":55,"z":21},"position":{"x":[0,0,0,0],"y":[-30,-25,25,30],"z":[0,0,0,0]},"width":[5,8,8,5],"height":[0,0,0,0],"texture":[63],"propeller":false,"vertical":false,"angle":45},"wing_base":{"section_segments":4,"offset":{"x":120,"y":115,"z":10},"position":{"x":[0,0,7,10,-15,-40,-35],"y":[-130,-95,-70,-40,0,30,35],"z":[0,0,10,30,40,40,40]},"width":[0,10,11,17,12,10,0],"height":[0,10,10,13,10,7,0],"texture":[4,3,2,1,-1],"propeller":false,"angle":45},"healinglaser":{"section_segments":8,"offset":{"x":20,"y":-60,"z":0},"position":{"x":[-7,-5,0,5,5,0,0,10],"y":[-95,-70,-50,-40,-20,-10,60,110],"z":[-15,-10,-10,-10,-10,-5,0,0]},"width":[0,4,6,7,7,5,10,5],"height":[0,4,6,7,7,5,5,5],"texture":[-1,13,4,8,1,1,3],"propeller":false,"angle":5},"healinglaser2":{"section_segments":8,"offset":{"x":0,"y":-50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-95,-70,-50,-40,-20,-10,60,140],"z":[-10,-10,-10,-10,-10,-5,0,0]},"width":[0,4,5,7,7,5,10,5],"height":[0,4,5,7,7,5,5,5],"texture":[-1,13,4,8],"propeller":false,"angle":0,"laser":{"damage":[80,80],"rate":2,"type":2,"speed":[180,180],"number":1,"error":0,"angle":0,"recoil":100}}},"wings":{"main":{"offset":{"x":20,"y":90,"z":-5},"length":[35,-15,40],"width":[30,40,160,90],"angle":[0,0,-30],"position":[-10,-20,-40,-10],"texture":[4,13,63],"doubleside":true,"bump":{"position":20,"size":15}},"fang1":{"offset":{"x":18,"y":-95,"z":-8},"length":[-10,25],"width":[0,90,100],"angle":[-20,-20],"position":[0,15,0],"texture":[13,63],"doubleside":true,"bump":{"position":20,"size":30}},"fang2":{"offset":{"x":35,"y":-75,"z":-10},"length":[-10,15,15],"width":[0,40,60,0],"angle":[0,0,30],"position":[0,10,0,30],"texture":[13,3,63],"doubleside":true,"bump":{"position":20,"size":20}},"feather1":{"offset":{"x":110,"y":110,"z":30},"length":[60,10],"width":[80,20,0],"angle":[180,180],"position":[0,110,120],"texture":[49,1],"doubleside":true,"bump":{"position":20,"size":15}},"feather2":{"offset":{"x":95,"y":95,"z":30},"length":[75,10],"width":[70,20,0],"angle":[180,180],"position":[0,105,110],"texture":[49,1],"doubleside":true,"bump":{"position":20,"size":15}},"feather3":{"offset":{"x":85,"y":70,"z":15},"length":[0,70,10],"width":[0,70,20,0],"angle":[0,180,180],"position":[0,20,80,85],"texture":[49,49,1],"doubleside":true,"bump":{"position":20,"size":15}},"feather4":{"offset":{"x":75,"y":70,"z":15},"length":[0,50,10],"width":[0,50,20,0],"angle":[0,180,180],"position":[0,0,30,35],"texture":[49,49,1],"doubleside":true,"bump":{"position":20,"size":15}},"cockpit":{"offset":{"x":0,"y":-15,"z":13.5},"length":[12,10],"width":[46,30,0],"angle":[-7,-20],"position":[0,0,10],"texture":[9,4],"doubleside":true,"bump":{"position":30,"size":16}},"cockpit_top":{"offset":{"x":0,"y":5,"z":20},"length":[12,20],"width":[30,30,70],"angle":[0,-53],"position":[0,0,15],"texture":[13,4],"doubleside":true,"bump":{"position":30,"size":10}}},"typespec":{"name":"Valkyrie","level":7,"model":35,"code":735,"specs":{"shield":{"capacity":[260,260],"reload":[12,12]},"generator":{"capacity":[160,160],"reload":[55,55]},"ship":{"mass":225,"speed":[160,160],"rotation":[70,70],"acceleration":[140,140]}},"shape":[3.452,3.201,3.327,2.517,2.258,1.947,1.746,1.749,1.746,1.753,1.136,1.179,1.253,1.348,1.491,1.705,1.901,3.125,3.59,4.191,4.561,4.521,4.872,5.272,5.245,4.633,5.245,5.272,4.872,4.521,4.561,4.191,3.59,3.125,1.901,1.705,1.491,1.348,1.253,1.179,1.136,1.753,1.746,1.749,1.746,1.947,2.258,2.517,3.327,3.201],"lasers":[{"x":0,"y":-3.248,"z":0,"angle":0,"damage":[80,80],"rate":2,"type":2,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":100}],"radius":5.272}}'
        },
        name: "Heal",
        cooldown: 25 * 60,
        duration: 15 * 60,

        customEndcondition: true,
        cooldownRestartOnEnd: true,
        customInAbilityText: true,
        canStartOnAbility: true,

        healingCooldown: 5 * 60,
        healingRingDuration: 15 * 60,

        range: 30,
        showAbilityRangeUI: true,
        includeRingOnModel: {
            default: true,
            ability: false
        },

        objScale: Math.sqrt(5),

        healAmount: 50,
        healTick: 1 * 60,

        activeRings: new Map(),

        addActiveRing: function (ship) {
            this.activeRings.set(ship.id, {
                start: game.step,
                x: ship.x,
                y: ship.y,
                team: ship.team,
                id: ship.id,
                ship
            });

            HelperFunctions.setPlaneOBJ({
                id: "healing_base_" + ship.id,
                position: { x: ship.x, y: ship.y },
                scale: {x: this.range * this.objScale, y: this.range * this.objScale },
                rotation: { x: 0, y: 0, z: 0 },
                type: {
                    id: "healing_base_" + ship.team,
                    emissive: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/healing_area.png",
                    emissiveColor: HelperFunctions.toHSLA(TeamManager.getDataFromShip(ship).hue)
                }
            });
        },

        removeActiveRing: function (ship) {
            this.activeRings.delete(ship.id);

            HelperFunctions.removeObject("healing_base_"+ship.id);
        },

        endName: "Un-Heal",

        abilityName: function (ship) {
            return ship.custom.inAbility ? this.endName: this.name;
        },

        requirementsText: function (ship) {
            return ship.custom.inAbility ? HelperFunctions.timeLeft(ship.custom.lastTriggered + this.healingCooldown) : HelperFunctions.templates.requirementsText.call(this, ship);
        },

        initialize: function (ship) {
            ship.set({healing: true});
        },

        enoughHealing: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.healingCooldown);
        },

        canStart: function (ship) {
            return ship.custom.inAbility ? this.enoughHealing(ship) : HelperFunctions.templates.canStart.call(this, ship);
        },

        start: function (ship, lastStatus) {
            if (lastStatus) return ship.custom.forceEnd = true;

            HelperFunctions.templates.start.call(this, ship);
            ship.set({healing: false});

            this.addActiveRing(ship);
        },

        end: function (ship) {
            HelperFunctions.templates.end.call(this, ship);
            ship.set({healing: true});
        },

        globalTick: function (game) {
            for (let ring of this.activeRings.values()) {
                let duration = game.step - ring.start;
                if (duration % this.healTick === 0) {
                    let nearestShips = HelperFunctions.findEntitiesInRange(ring, this.range, true, false, { ships: true, self: true }, true);
                    for (let ship of nearestShips) ship.set({shield: ship.shield + this.healAmount});
                }
                if (duration > this.healingRingDuration) this.removeActiveRing(ring.ship);
            }
        },

        onCodeChanged: function (newTemplate) {
            if (newTemplate == null) {
                for (let ring of this.activeRings.values()) this.removeActiveRing(ring.ship);
                return;
            }
            newTemplate.activeRings = this.activeRings;
        },
    },
    "Spitfire": {
        models: {
            default: '{"name":"Spitfire","designer":"Nex","level":6,"model":36,"size":1.82,"zoom":0.85,"specs":{"shield":{"capacity":[180,180],"reload":[6,6]},"generator":{"capacity":[100,100],"reload":[60,60]},"ship":{"mass":220,"speed":[90,90],"rotation":[50,50],"acceleration":[120,120]}},"bodies":{"body":{"section_segments":8,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-70,-70,-50,-55,-30,-15,20,40,55,70,90,105,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,18,22,25,24,30,30,30,22,32,20,20,0],"height":[0,18,22,25,24,30,30,30,22,32,20,20,0],"texture":[1,8,2,63,4,11,2,4,13,1,8,17],"propeller":true},"feeder":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-1,"z":85},"position":{"x":[0,0,0,0,0,0],"y":[10,10,50,55,55,55],"z":[-170,-170,-170,-170,-170,-170]},"width":[0,12,12,8,8,0],"height":[0,30,30,25,28,0],"texture":[15,15,4,4,17],"vertical":true,"angle":67},"ammo_box":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-35,"z":-30},"position":{"x":[45,45,45,45],"y":[0,5,60,65],"z":[0,0,0,0]},"width":[0,25,25,0],"height":[0,30,30,0],"texture":[6,8,6],"angle":0},"sight":{"section_segments":8,"offset":{"x":0,"y":30,"z":35},"position":{"x":[12,12,12,12,12,12,12,12],"y":[-57,-40,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,7,10,10,10,10,0],"height":[0,5,7,10,10,10,10,0],"angle":0,"propeller":false,"texture":[6,4,10,4,63,4]},"big_booster":{"section_segments":8,"offset":{"x":0,"y":45,"z":-20},"position":{"x":[-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30],"y":[-100,-80,-85,-80,-65,-40,-30,-20,-10,10,40,50,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4,10,15,17,18,13,13,18,18,18,15,0],"height":[0,4,10,15,17,18,13,13,18,18,18,15,0],"texture":[6,13,4,2,11,13,4,13,63,8,4,17],"propeller":true},"antennae":{"section_segments":6,"offset":{"x":0,"y":50,"z":-22.25},"position":{"x":[-10.5,-10.5,-10.5,-10.5,-10.5,-10.5],"y":[-50,-20,10,30],"z":[0,0,0,0]},"width":[2,2,2,0],"height":[2,2,2,0],"angle":0,"vertical":true,"propeller":false,"texture":1},"antennae_massive":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":35,"z":-22.5},"position":{"x":[-10.5,-10.5,-10.5,-10.5,-10.5,-10.5],"y":[-20,-20,0,0,0],"z":[0,0,0,0,0]},"width":[0,10,10,5,0],"height":[0,10,10,5,0],"texture":[4,4,63,17],"propeller":false,"vertical":1},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-8,"z":15},"position":{"x":[45,45,45,45,45,45],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"height":[0,10,10,6,4,0],"width":[0,25,25,20,24,0],"texture":[15,15,4,4,17],"vertical":true,"angle":0},"bullet1":{"section_segments":6,"offset":{"x":0,"y":85,"z":20},"position":{"x":[50,50,50,50],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":0,"propeller":false,"texture":[6,63,4]},"bullet2":{"section_segments":6,"offset":{"x":0,"y":87,"z":22},"position":{"x":[55,55,55,55],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":4,"propeller":false,"texture":[6,63,4]},"bullet3":{"section_segments":6,"offset":{"x":0,"y":92,"z":22},"position":{"x":[60,60,60,60],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":9,"propeller":false,"texture":[6,63,4]},"bullet4":{"section_segments":6,"offset":{"x":0,"y":96,"z":21},"position":{"x":[65,65,65,65],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":13,"propeller":false,"texture":[6,63,4]},"bullet5":{"section_segments":6,"offset":{"x":0,"y":102,"z":18},"position":{"x":[71,71,71,71],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":18,"propeller":false,"texture":[6,63,4]},"bullet6":{"section_segments":6,"offset":{"x":0,"y":105,"z":14},"position":{"x":[76,76,76,76],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":21,"propeller":false,"texture":[6,63,4]},"bullet7":{"section_segments":6,"offset":{"x":0,"y":111,"z":9},"position":{"x":[82,82,82,82],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":25,"propeller":false,"texture":[6,63,4]},"bullet8":{"section_segments":6,"offset":{"x":0,"y":117,"z":4},"position":{"x":[88,88,88,88],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":29,"propeller":false,"texture":[6,63,4]},"bullet9":{"section_segments":6,"offset":{"x":0,"y":122,"z":1},"position":{"x":[95,95,95,95],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":33,"propeller":false,"texture":[6,63,4]},"bullet10":{"section_segments":6,"offset":{"x":0,"y":136,"z":1},"position":{"x":[108,108,108,108],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":40,"propeller":false,"texture":[6,63,4]},"bullet11":{"section_segments":6,"offset":{"x":0,"y":158,"z":1},"position":{"x":[128,128,128,128],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":48.5,"propeller":false,"texture":[6,63,4]},"bullet12":{"section_segments":6,"offset":{"x":0,"y":175,"z":1},"position":{"x":[145,145,145,145],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":53.5,"propeller":false,"texture":[6,63,4]},"bullet13":{"section_segments":6,"offset":{"x":0,"y":229,"z":1},"position":{"x":[195,195,195,195],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":63.4,"propeller":false,"texture":[6,63,4]},"bullet14":{"section_segments":6,"offset":{"x":0,"y":295,"z":1},"position":{"x":[260,260,260,260],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":70.5,"propeller":false,"texture":[6,63,4]},"bullet15":{"section_segments":6,"offset":{"x":0,"y":527,"z":1},"position":{"x":[490,490,490,490],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":79.8,"propeller":false,"texture":[6,63,4]},"bullet16":{"section_segments":6,"offset":{"x":0,"y":90,"z":0},"position":{"x":[50,50,50,50],"y":[72,82,99,102],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":90,"propeller":false,"texture":[6,63,4]},"bullet17":{"section_segments":6,"offset":{"x":0,"y":100,"z":0},"position":{"x":[50,50,50,50],"y":[80,90,107,110],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":100,"propeller":false,"texture":[6,63,4]},"bullet18":{"section_segments":6,"offset":{"x":0,"y":113,"z":0},"position":{"x":[50,50,50,50],"y":[90,100,117,120],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":110,"propeller":false,"texture":[6,63,4]},"bullet19":{"section_segments":6,"offset":{"x":0,"y":128,"z":0},"position":{"x":[50,50,50,50],"y":[101,111,128,131],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":120.5,"propeller":false,"texture":[6,63,4]},"bullet20":{"section_segments":6,"offset":{"x":0,"y":137,"z":0},"position":{"x":[50,50,50,50],"y":[107,117,134,137],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":127,"propeller":false,"texture":[6,63,4]},"bullet27":{"section_segments":6,"offset":{"x":0,"y":45,"z":5},"position":{"x":[50,50,50,50],"y":[35,45,62,65],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":95,"propeller":false,"texture":[6,63,4]},"bullet28":{"section_segments":6,"offset":{"x":0,"y":35,"z":0},"position":{"x":[50,50,50,50],"y":[30,40,57,60],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":90,"propeller":false,"texture":[6,63,4]},"bullet29":{"section_segments":6,"offset":{"x":0,"y":60,"z":10},"position":{"x":[50,50,50,50],"y":[47,57,74,77],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":105,"propeller":false,"texture":[6,63,4]},"bullet30":{"section_segments":6,"offset":{"x":0,"y":60,"z":10},"position":{"x":[50,50,50,50],"y":[47,57,74,77],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":105,"propeller":false,"texture":[6,63,4]},"bullet31":{"section_segments":6,"offset":{"x":0,"y":73,"z":10},"position":{"x":[50,50,50,50],"y":[55,65,82,85],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":110,"propeller":false,"texture":[6,63,4]},"bullet32":{"section_segments":6,"offset":{"x":0,"y":88,"z":5},"position":{"x":[50,50,50,50],"y":[65,75,92,95],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":115,"propeller":false,"texture":[6,63,4]},"bullet33":{"section_segments":6,"offset":{"x":0,"y":115,"z":0},"position":{"x":[50,50,50,50],"y":[88,98,115,118],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":125,"propeller":false,"texture":[6,63,4]},"bullet34":{"section_segments":6,"offset":{"x":0,"y":152,"z":0},"position":{"x":[50,50,50,50],"y":[121,131,148,151],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":135,"propeller":false,"texture":[6,63,4]},"barrel":{"section_segments":6,"offset":{"x":0,"y":-100,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-90,-70,-50,-30,-15,0,10,20,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,8,7,8,10,10,8,9,10,0],"height":[0,8,8,7,8,10,10,8,10,10,0],"texture":[49,4,13,13,4,63,4],"propeller":false,"angle":0,"laser":{"damage":[25,25],"rate":1,"type":1,"speed":[450,450],"number":4,"error":0,"angle":0,"recoil":65}},"muzzle_brake":{"section_segments":8,"offset":{"x":0,"y":-190,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-19,-20,-30,-22,-10,-2.5,5,0,-1],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,10,11,10,6,0],"height":[0,6,10,10,10,11,10,6,0],"texture":[17,4,3,8,63,3,4,17],"propeller":false,"laser":{"damage":[100,100],"rate":1,"type":2,"speed":[4,4],"number":100,"error":0,"angle":0,"recoil":99999}},"rail":{"section_segments":4,"offset":{"x":0,"y":-60,"z":8},"position":{"x":[0,0,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[4,4,4,2],"height":[4,5,5,2],"angle":0,"propeller":false,"texture":63},"harry_potter_and_the_chamber_of_secrets":{"section_segments":8,"offset":{"x":5,"y":-110,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-15,-15,-10,10,20,40,40,80],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,8,8,3,3,6,8],"height":[0,4,8,8,3,3,6,8],"texture":[3,3,8,4,63,4,4]},"cookring":{"section_segments":5,"offset":{"x":0,"y":-103,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,15,15],"height":[0,15,15],"texture":[63],"propeller":false}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":75,"z":-5},"length":[30,50,15,20],"width":[80,80,60,40,20],"angle":[-50,70,130,190],"position":[-50,-55,-40,-10,-25],"texture":[13,4,63,3],"bump":{"position":0,"size":10}}},"typespec":{"name":"Spitfire","level":6,"model":36,"code":636,"specs":{"shield":{"capacity":[180,180],"reload":[6,6]},"generator":{"capacity":[100,100],"reload":[60,60]},"ship":{"mass":220,"speed":[90,90],"rotation":[50,50],"acceleration":[120,120]}},"shape":[8.016,4.562,2.224,1.934,1.675,1.566,1.692,2.124,2.378,2.529,2.45,2.355,2.307,2.584,3.589,3.993,4.185,4.364,4.414,4.437,4.344,4.272,4.263,4.062,4.608,4.559,4.608,4.025,3.822,3.826,3.254,2.74,2.395,2.155,1.785,1.683,1.741,1.757,1.745,1.777,1.841,1.922,2.035,2.075,2.06,2.114,2.28,1.934,2.224,4.562],"lasers":[{"x":0,"y":-6.916,"z":0,"angle":0,"damage":[25,25],"rate":1,"type":1,"speed":[450,450],"number":4,"spread":0,"error":0,"recoil":65},{"x":0,"y":-8.008,"z":0,"angle":0,"damage":[100,100],"rate":1,"type":2,"speed":[4,4],"number":100,"spread":0,"error":0,"recoil":99999}],"radius":8.016}}',
            ability: '{"name":"Spitfire T7","designer":"Nex","level":7,"model":36,"size":1.85,"zoom":0.85,"specs":{"shield":{"capacity":[350,350],"reload":[15,15]},"generator":{"capacity":[80,80],"reload":[150,150]},"ship":{"mass":450,"speed":[100,100],"rotation":[45,45],"acceleration":[110,110]}},"bodies":{"body":{"section_segments":8,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-70,-70,-50,-55,-30,-15,20,40,55,70,90,105,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,18,22,27,24,30,30,30,22,32,20,20,0],"height":[0,18,22,25,24,30,30,30,22,32,20,20,0],"texture":[1,8,2,63,4,11,2,4,13,1,8,17],"propeller":true},"feeder":{"section_segments":[45,135,225,315],"offset":{"x":0.01,"y":-1,"z":85},"position":{"x":[0,0,0,0,0,0],"y":[10,10,50,55,55,55],"z":[-170,-170,-170,-170,-170,-170]},"width":[0,12,12,8,8,0],"height":[0,30,30,25,28,0],"texture":[15,15,4,4,17],"vertical":true,"angle":67},"ammo_box":{"section_segments":[45,135,225,315],"offset":{"x":0.01,"y":-35,"z":-30},"position":{"x":[45,45,45,45],"y":[0,5,60,65],"z":[0,0,0,0]},"width":[0,25,25,0],"height":[0,30,30,0],"texture":[6,8,6],"angle":0},"sight":{"section_segments":8,"offset":{"x":0,"y":30,"z":35},"position":{"x":[12,12,12,12,12,12,12,12],"y":[-57,-40,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,7,10,10,10,10,0],"height":[0,5,7,10,10,10,10,0],"angle":0,"propeller":false,"texture":[6,4,10,4,63,4]},"antennae":{"section_segments":6,"offset":{"x":0,"y":50,"z":-22.25},"position":{"x":[-10.5,-10.5,-10.5,-10.5,-10.5,-10.5],"y":[-50,-20,10,30],"z":[0,0,0,0]},"width":[2,2,2,0],"height":[2,2,2,0],"angle":0,"vertical":true,"propeller":false,"texture":1},"antennaeass":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":35,"z":-22.5},"position":{"x":[-10.5,-10.5,-10.5,-10.5,-10.5,-10.5],"y":[-20,-20,0,0,0],"z":[0,0,0,0,0]},"width":[0,10,10,5,0],"height":[0,10,10,5,0],"texture":[4,4,63,17],"propeller":false,"vertical":1},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":0.01,"y":-8,"z":15},"position":{"x":[45,45,45,45,45,45],"y":[-7,-7,6,7,5,5],"z":[0,0,0,0,0,0]},"height":[0,10,10,6,4,0],"width":[0,25,25,20,24,0],"texture":[15,15,4,4,17],"vertical":true,"angle":0},"bullet1":{"section_segments":6,"offset":{"x":0.01,"y":85,"z":20},"position":{"x":[50,50,50,50],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":0,"propeller":false,"texture":[6,63,4]},"bullet2":{"section_segments":6,"offset":{"x":0.01,"y":87,"z":22},"position":{"x":[55,55,55,55],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":4,"propeller":false,"texture":[6,63,4]},"bullet3":{"section_segments":6,"offset":{"x":0.01,"y":92,"z":22},"position":{"x":[60,60,60,60],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":9,"propeller":false,"texture":[6,63,4]},"bullet4":{"section_segments":6,"offset":{"x":0.01,"y":96,"z":21},"position":{"x":[65,65,65,65],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":13,"propeller":false,"texture":[6,63,4]},"bullet5":{"section_segments":6,"offset":{"x":0.01,"y":102,"z":18},"position":{"x":[71,71,71,71],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":18,"propeller":false,"texture":[6,63,4]},"bullet6":{"section_segments":6,"offset":{"x":0.01,"y":105,"z":14},"position":{"x":[76,76,76,76],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":21,"propeller":false,"texture":[6,63,4]},"bullet7":{"section_segments":6,"offset":{"x":0.01,"y":111,"z":9},"position":{"x":[82,82,82,82],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":25,"propeller":false,"texture":[6,63,4]},"bullet8":{"section_segments":6,"offset":{"x":0.01,"y":117,"z":4},"position":{"x":[88,88,88,88],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":29,"propeller":false,"texture":[6,63,4]},"bullet9":{"section_segments":6,"offset":{"x":0.01,"y":122,"z":1},"position":{"x":[95,95,95,95],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":33,"propeller":false,"texture":[6,63,4]},"bullet10":{"section_segments":6,"offset":{"x":0.01,"y":136,"z":1},"position":{"x":[108,108,108,108],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":40,"propeller":false,"texture":[6,63,4]},"bullet11":{"section_segments":6,"offset":{"x":0.01,"y":158,"z":1},"position":{"x":[128,128,128,128],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":48.5,"propeller":false,"texture":[6,63,4]},"bullet12":{"section_segments":6,"offset":{"x":0.01,"y":175,"z":1},"position":{"x":[145,145,145,145],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":53.5,"propeller":false,"texture":[6,63,4]},"bullet13":{"section_segments":6,"offset":{"x":0.01,"y":229,"z":1},"position":{"x":[195,195,195,195],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":63.4,"propeller":false,"texture":[6,63,4]},"bullet14":{"section_segments":6,"offset":{"x":0.01,"y":295,"z":1},"position":{"x":[260,260,260,260],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":70.5,"propeller":false,"texture":[6,63,4]},"bullet15":{"section_segments":6,"offset":{"x":0.01,"y":527,"z":1},"position":{"x":[490,490,490,490],"y":[-15,-5,12,15],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":79.8,"propeller":false,"texture":[6,63,4]},"bullet16":{"section_segments":6,"offset":{"x":0.01,"y":90,"z":0},"position":{"x":[50,50,50,50],"y":[72,82,99,102],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":90,"propeller":false,"texture":[6,63,4]},"bullet17":{"section_segments":6,"offset":{"x":0.01,"y":100,"z":0},"position":{"x":[50,50,50,50],"y":[80,90,107,110],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":100,"propeller":false,"texture":[6,63,4]},"bullet18":{"section_segments":6,"offset":{"x":0.01,"y":113,"z":0},"position":{"x":[50,50,50,50],"y":[90,100,117,120],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":110,"propeller":false,"texture":[6,63,4]},"bullet19":{"section_segments":6,"offset":{"x":0.01,"y":128,"z":0},"position":{"x":[50,50,50,50],"y":[101,111,128,131],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":120.5,"propeller":false,"texture":[6,63,4]},"bullet20":{"section_segments":6,"offset":{"x":0.01,"y":137,"z":0},"position":{"x":[50,50,50,50],"y":[107,117,134,137],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":127,"propeller":false,"texture":[6,63,4]},"bullet27":{"section_segments":6,"offset":{"x":0.01,"y":45,"z":5},"position":{"x":[50,50,50,50],"y":[35,45,62,65],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":95,"propeller":false,"texture":[6,63,4]},"bullet28":{"section_segments":6,"offset":{"x":0.01,"y":35,"z":0},"position":{"x":[50,50,50,50],"y":[30,40,57,60],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":90,"propeller":false,"texture":[6,63,4]},"bullet29":{"section_segments":6,"offset":{"x":0.01,"y":60,"z":10},"position":{"x":[50,50,50,50],"y":[47,57,74,77],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":105,"propeller":false,"texture":[6,63,4]},"bullet30":{"section_segments":6,"offset":{"x":0.01,"y":60,"z":10},"position":{"x":[50,50,50,50],"y":[47,57,74,77],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":105,"propeller":false,"texture":[6,63,4]},"bullet31":{"section_segments":6,"offset":{"x":0.01,"y":73,"z":10},"position":{"x":[50,50,50,50],"y":[55,65,82,85],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":110,"propeller":false,"texture":[6,63,4]},"bullet32":{"section_segments":6,"offset":{"x":0.01,"y":88,"z":5},"position":{"x":[50,50,50,50],"y":[65,75,92,95],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":115,"propeller":false,"texture":[6,63,4]},"bullet33":{"section_segments":6,"offset":{"x":0.01,"y":115,"z":0},"position":{"x":[50,50,50,50],"y":[88,98,115,118],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":125,"propeller":false,"texture":[6,63,4]},"bullet34":{"section_segments":6,"offset":{"x":0.01,"y":152,"z":0},"position":{"x":[50,50,50,50],"y":[121,131,148,151],"z":[0,0,0,0]},"width":[0,2.5,3,2],"height":[0,2.5,3,2],"angle":135,"propeller":false,"texture":[6,63,4]},"barrel":{"section_segments":6,"offset":{"x":15,"y":-100,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-90,-70,-50,-30,-15,0,10,20,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,8,7,8,10,10,8,9,10,0],"height":[0,8,8,7,8,10,10,8,10,10,0],"texture":[49,4,13,13,4,63,4],"propeller":false,"angle":0,"laser":{"damage":[20,20],"rate":10,"type":1,"speed":[630,630],"number":4,"error":0,"angle":0,"recoil":30}},"muzzle_brake":{"section_segments":8,"offset":{"x":15,"y":-190,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-19,-20,-30,-22,-10,-2.5,5,0,-1],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,10,11,10,6,0],"height":[0,6,10,10,10,11,10,6,0],"texture":[17,4,3,8,63,3,4,17],"propeller":false},"rail":{"section_segments":4,"offset":{"x":15,"y":-60,"z":8},"position":{"x":[0,0,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[4,4,4,2],"height":[4,5,5,2],"angle":0,"propeller":false,"texture":63},"harry_potter_and_the_chamber_of_secrets":{"section_segments":8,"offset":{"x":5,"y":-110,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-15,-15,-10,10,20,40,40,80],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,8,8,3,3,6,8],"height":[0,4,8,8,3,3,6,8],"texture":[3,3,8,4,63,4,4]},"cookring":{"section_segments":5,"offset":{"x":15,"y":-103,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,15,15],"height":[0,15,15],"texture":[63],"propeller":false}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":75,"z":-5},"length":[30,50,15,20],"width":[80,80,60,40,20],"angle":[-50,70,130,190],"position":[-50,-55,-40,-10,-25],"texture":[13,4,63,3],"bump":{"position":0,"size":10}}},"typespec":{"name":"Spitfire T7","level":7,"model":36,"code":736,"specs":{"shield":{"capacity":[350,350],"reload":[15,15]},"generator":{"capacity":[80,80],"reload":[150,150]},"ship":{"mass":450,"speed":[100,100],"rotation":[45,45],"acceleration":[110,110]}},"shape":[8.156,8.192,4.541,2.743,2.025,1.636,1.72,2.159,2.417,2.571,2.49,2.394,2.345,2.627,3.648,4.059,4.255,4.437,4.487,4.51,4.416,4.343,4.333,4.129,4.684,4.634,4.684,4.129,4.333,4.343,4.416,4.51,4.487,4.437,4.255,4.059,3.648,2.627,2.345,2.394,2.49,2.571,2.417,2.159,1.72,1.636,2.025,2.743,4.541,8.192],"lasers":[{"x":0.555,"y":-7.03,"z":0,"angle":0,"damage":[20,20],"rate":10,"type":1,"speed":[630,630],"number":4,"spread":0,"error":0,"recoil":30},{"x":-0.555,"y":-7.03,"z":0,"angle":0,"damage":[20,20],"rate":10,"type":1,"speed":[630,630],"number":4,"spread":0,"error":0,"recoil":30}],"radius":8.192}}'
        },
        name: "Hypervelocity",
        cooldown: 34 * 60,
        duration: 8.4 * 60,
        endOnDeath: true
    },
    "Mosquit": {
        models: {
            default: '{"name":"Mosquit","level":6,"model":37,"size":1.45,"specs":{"shield":{"capacity":[100,100],"reload":[15,15]},"generator":{"capacity":[120,120],"reload":[62,62]},"ship":{"mass":120,"speed":[152,152],"rotation":[150,150],"acceleration":[160,160]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,0,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,25,30,18,15,0],"height":[0,6,8,12,18,20,20,18,15,0],"propeller":true,"texture":[4,63,10,2,63,3,2,12,17]},"props":{"section_segments":8,"offset":{"x":20,"y":-5,"z":-12},"position":{"x":[-15,-10,0,0,0,0,0,0,0,0],"y":[-60,-45,-30,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,12,0],"height":[0,5,10,10,15,10,10,15,15,0],"texture":[63,3,63,4,5,5,63,8,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,-5,15,30,60],"z":[0,0,0,0,0]},"width":[0,8,15,10,5],"height":[0,15,20,15,5],"propeller":false,"texture":[4,9,9,4,4]},"cannons":{"section_segments":8,"offset":{"x":0,"y":-110,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[5,0,23,27,62,62,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,7,4,4,7,7],"height":[0,5,5,7,7,4,4,7,7],"texture":[12,13,4,8,4,4,3,8],"propeller":false,"laser":{"damage":[35,35],"rate":4,"type":1,"speed":[255,255],"number":1}},"side":{"section_segments":12,"offset":{"x":60,"y":40,"z":-15},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,-10,0,10,15],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,10,10,0],"height":[0,5,10,10,10,5,0],"angle":0,"propeller":false,"texture":[6,4,10,4,63,4]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]},"main2":{"length":[41,12,0],"width":[60,28,28,0],"angle":[-10,-20,0],"position":[6,20,21,20],"doubleside":true,"offset":{"x":0,"y":10,"z":14},"bump":{"position":30,"size":20},"texture":[63]}},"typespec":{"name":"Mosquit","level":6,"model":37,"code":637,"specs":{"shield":{"capacity":[100,100],"reload":[15,15]},"generator":{"capacity":[120,120],"reload":[62,62]},"ship":{"mass":120,"speed":[152,152],"rotation":[150,150],"acceleration":[160,160]}},"shape":[3.193,2.502,1.734,1.609,1.526,1.471,1.442,1.387,1.254,1.155,1.17,1.815,1.913,2.302,2.357,2.453,2.562,2.523,2.484,2.329,2.106,2.101,2.083,2.218,2.214,2.179,2.214,2.218,2.083,2.101,2.106,2.329,2.484,2.523,2.562,2.453,2.357,2.302,2.285,1.815,1.17,1.155,1.254,1.387,1.442,1.471,1.526,1.609,1.734,2.502],"lasers":[{"x":0,"y":-3.19,"z":-0.29,"angle":0,"damage":[35,35],"rate":4,"type":1,"speed":[255,255],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.193}}',
            ability: '{"name":"God","level":7,"model":37,"size":3,"specs":{"shield":{"capacity":[400,400],"reload":[25,25]},"generator":{"capacity":[200,200],"reload":[50,50]},"ship":{"mass":1500,"speed":[150,150],"rotation":[25,25],"acceleration":[120,120],"dash":{"rate":1,"burst_speed":[250,250],"speed":[180,180],"acceleration":[200,200],"initial_energy":[100,100],"energy":[100,100]}}},"bodies":{"main":{"section_segments":56,"offset":{"x":0,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-125,-120,-110,-95,-80,-25,0,10,15,25,35,50,55,50,50],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,35,45,50,50,50,50,40,40,50,50,40,30,0],"height":[0,20,35,45,50,50,50,50,40,40,50,50,40,30,0],"propeller":1,"texture":[63,4,4,4,4,4,4,3,8,3,4,63,5,17]},"top_propulsor":{"section_segments":15,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0],"y":[80,95,100,90],"z":[0,0,0,0]},"width":[5,20,44,0],"height":[5,15,5,0],"propeller":true,"texture":[1,63,12]},"top_propulsor2":{"section_segments":15,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0],"y":[80,95,100,90],"z":[0,0,0,0]},"width":[5,20,44,0],"height":[5,15,5,0],"propeller":true,"texture":[1,63,12]},"logo":{"vertical":1,"section_segments":20,"offset":{"x":0,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-5,5,5,2.1,2.1,2.1],"z":[0,0,0,0,0,0]},"width":[20,20,16,16,12,0],"height":[20,20,16,16,12,0],"texture":[63,63,63,17,5]},"logo2":{"vertical":1,"section_segments":20,"offset":{"x":50,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-5,5,5,2.1,2.1,2.1],"z":[0,0,0,0,0,0]},"width":[20,20,16,16,12,0],"height":[20,20,16,16,12,0],"texture":[63,63,63,17,5],"angle":90},"logo3":{"vertical":1,"section_segments":20,"offset":{"x":0,"y":-50,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-5,5,5,2.1,2.1,2.1],"z":[0,0,0,0,0,0]},"width":[20,20,16,16,12,0],"height":[20,20,16,16,12,0],"texture":[63,63,63,17,5],"angle":180},"connector":{"section_segments":56,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-5,5,5,-5,-5],"z":[0,0,0,0,0]},"width":[52,52,16,16,52],"height":[52,52,16,16,52],"texture":[63],"angle":0},"x":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":51},"position":{"x":[4,0,-4],"y":[-4,0,4],"z":[0,0,0]},"width":[2,2,2],"height":[2,2,2],"texture":[63],"angle":0},"x2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":51},"position":{"x":[-4,0,4],"y":[-4,0,4],"z":[0,0,0]},"width":[2,2,2],"height":[2,2,2],"texture":[63],"angle":0},"x3":{"vertical":1,"section_segments":[45,135,225,315],"offset":{"x":51,"y":0,"z":0},"position":{"x":[0,0,0],"y":[-4,0,4],"z":[-4,0,4]},"width":[2,2,2],"height":[2,2,2],"texture":[63],"angle":0},"x4":{"vertical":1,"section_segments":[45,135,225,315],"offset":{"x":51,"y":0,"z":0},"position":{"x":[0,0,0],"y":[-4,0,4],"z":[4,0,-4]},"width":[2,2,2],"height":[2,2,2],"texture":[63],"angle":0},"x5":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":-51},"position":{"x":[4,0,-4],"y":[-4,0,4],"z":[0,0,0]},"width":[2,2,2],"height":[2,2,2],"texture":[63],"angle":0},"x6":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":-51},"position":{"x":[-4,0,4],"y":[-4,0,4],"z":[0,0,0]},"width":[2,2,2],"height":[2,2,2],"texture":[63],"angle":0}},"typespec":{"name":"God","level":7,"model":37,"code":737,"specs":{"shield":{"capacity":[400,400],"reload":[25,25]},"generator":{"capacity":[200,200],"reload":[50,50]},"ship":{"mass":1500,"speed":[150,150],"rotation":[25,25],"acceleration":[120,120],"dash":{"rate":1,"burst_speed":[250,250],"speed":[180,180],"acceleration":[200,200],"initial_energy":[100,100],"energy":[100,100]}}},"shape":[5.7,5.622,5.538,5.357,5.148,4.823,4.47,4.105,3.705,3.422,3.511,3.407,3.326,3.326,3.407,3.511,3.417,3.707,3.842,3.763,5.592,5.66,5.636,5.362,5.192,5.11,5.192,5.362,5.636,5.66,5.592,3.763,3.842,3.707,3.417,3.511,3.407,3.326,3.326,3.407,3.511,3.422,3.705,4.105,4.47,4.823,5.148,5.357,5.538,5.622],"lasers":[],"radius":5.7}}'
        },
        name: "Meteor",
        cooldown: 35 * 60,
        duration: 10 * 60,
        endOnDeath: true
    },
    "Reaper": {
        models: {
            default: '{"name":"Reaper","designer":"Nex","level":6,"model":38,"size":3,"specs":{"shield":{"capacity":[450,450],"reload":[5,5]},"generator":{"capacity":[20,20],"reload":[500,500]},"ship":{"mass":700,"speed":[51,51],"rotation":[16,16],"acceleration":[100,100]}},"bodies":{"can1":{"section_segments":6,"offset":{"x":0,"y":-110,"z":17},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":0}},"can2":{"section_segments":6,"offset":{"x":0,"y":-110,"z":12},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":0}},"can3":{"section_segments":6,"offset":{"x":0,"y":-110,"z":0},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":0}},"can4":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-12},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":0}},"can5":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-17},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":0}},"can6":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-12},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can7":{"section_segments":6,"offset":{"x":0,"y":-110,"z":0},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can8":{"section_segments":6,"offset":{"x":0,"y":-110,"z":12},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can2_1":{"section_segments":0,"offset":{"x":0,"y":-110,"z":17},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can2_2":{"section_segments":0,"offset":{"x":0,"y":-110,"z":12},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can2_3":{"section_segments":0,"offset":{"x":0,"y":-110,"z":0},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can2_4":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can2_5":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":1}},"can2_6":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":2}},"can2_7":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":2}},"can2_8":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":2}},"can3_1":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":2}},"can3_2":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":2}},"can3_3":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":3}},"can3_4":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":3}},"can3_5":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":3}},"can3_6":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":3}},"can3_7":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":3}},"can3_8":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":3}},"can4_1":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":4}},"can4_2":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":4}},"can4_3":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":4}},"can4_4":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":5}},"can4_5":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":5}},"can4_6":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":5}},"can4_7":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":6}},"can4_8":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":7}},"can5_1":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":6}},"can5_2":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":6}},"can5_3":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":7}},"can5_4":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":7}},"can5_5":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":7}},"can5_6":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":8}},"can5_7":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":8}},"can5_8":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":8}},"can6_1":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":8}},"can6_2":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":8}},"can6_3":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":8}},"can6_4":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":8}},"can6_5":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":9}},"can6_6":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":9}},"can6_7":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":9}},"can6_8":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":9}},"can7_1":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":10}},"can7_2":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":10}},"can7_3":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":10}},"can7_4":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":10}},"can7_5":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":11}},"can7_6":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":11}},"can7_7":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":11}},"can7_8":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":11}},"can8_1":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":12}},"can8_2":{"section_segments":0,"offset":{"x":0,"y":-110,"z":15},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":13}},"can8_3":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[-17,-17,-17,-17,-17,-17,-17,-17,-17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":5}},"can8_4":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[-12,-12,-12,-12,-12,-12,-12,-12,-12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":15}},"can8_5":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":16}},"can8_6":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-15},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":17}},"can8_7":{"section_segments":0,"offset":{"x":0,"y":-110,"z":-5},"position":{"x":[17,17,17,17,17,17,17,17,17],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":18}},"can8_8":{"section_segments":0,"offset":{"x":0,"y":-110,"z":5},"position":{"x":[12,12,12,12,12,12,12,12,12],"y":[-85,-110,-75,-60,-55,-30,20,30,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,6,6,5,5,5,5,0],"height":[0,5,6,6,5,5,5,5,0],"angle":0,"propeller":false,"texture":[17,4,63,17,13,4,4],"laser":{"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"recoil":10,"error":20}},"main":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-60,-35,-40,-20,0,20,15,40,50,70,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,26,26,31,31,31,38,30,30,25,25,30,30,0],"height":[0,26,26,32,32,32,38,30,30,25,25,30,30,0],"texture":[13,12,4,10,2,63,4,18,4,13,4,3]},"pillowfightsbeta":{"section_segments":8,"offset":{"x":0,"y":10,"z":0},"position":{"x":[35,35,35,35,35,35,35,35,35,35],"y":[-50,-50,-45,-35,-25,35,45,55,60,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,20,20,20,15,0],"height":[0,15,20,20,20,20,20,20,15,0],"texture":[63,4,4,3,10,3,4,4,63]},"pablo":{"section_segments":8,"offset":{"x":0,"y":40,"z":0},"position":{"x":[-40,-40,-40,-40,-40,-40,-40,-40,-40,-40,-40],"y":[-30,-40,-20,-25,-10,20,30,70,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,7,16,16,16,20,20,17,17,0],"height":[0,14,14,25,25,25,30,30,17,17,0],"texture":[4,3,4,1,2,4,8,4,2,4,4]},"cockpittop":{"section_segments":6,"offset":{"x":0,"y":5,"z":32},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-40,-40,-28,-19,-4,15,15],"z":[0,0,0,0,0,0,0,0]},"width":[0,0,4,6,7,7,6,0],"height":[0,0,3,6,8,7,5,0],"propeller":false,"texture":[4,4,5,17,5]},"cockpitbottom":{"section_segments":6,"offset":{"x":0,"y":5,"z":29},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-46,-40,-28,-13,20,20],"z":[0,0,0,0,0,0,0]},"width":[0,4,8,13,16,15,0],"height":[0,3,5,6,8,5,0],"propeller":false,"texture":[3.9]},"cookring2":{"section_segments":8,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[35,35,35,35,35,35,35],"y":[-3,-3,3,3],"z":[0,0,0,0]},"width":[0,25,25,0],"height":[0,25,25,0],"texture":[17,63,17],"propeller":false},"cookring3":{"section_segments":8,"offset":{"x":0,"y":45,"z":0},"position":{"x":[35,35,35,35,35,35,35],"y":[-3,-3,3,3],"z":[0,0,0,0]},"width":[0,25,25,0],"height":[0,25,25,0],"texture":[17,63,17],"propeller":false},"cookring":{"section_segments":8,"offset":{"x":0,"y":-80,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-5,-3,3,7],"z":[0,0,0,0]},"width":[0,23,23,20],"height":[0,23,23,20],"texture":[1,1,17],"propeller":false},"cookring_final":{"section_segments":8,"offset":{"x":0,"y":-170,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-1,-6,3,3],"z":[0,0,0,0]},"width":[0,25,25,20],"height":[0,25,25,20],"texture":[4,1,17],"propeller":false},"propulsors":{"section_segments":8,"offset":{"x":15,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-25,-10,20,30,40,80,70],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,20,20,16,20,15,0],"height":[0,15,15,20,16,20,15,0],"texture":[4,3,2,4,4,8,17],"propeller":true},"Main_rings":{"section_segments":10,"offset":{"x":0,"y":-51,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-21,-18,-16,-14,-14,4,4,6,6,8],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,18,20,20,20,20,20,18,18,0],"height":[0,18,20,20,20,20,20,18,18,0],"texture":[17.93,4,4,4,13,17,4,18]},"Main_rings2":{"section_segments":10,"offset":{"x":0,"y":-67.8,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-21,-18,-16,-14,-14,4,4,6,6,8],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,14,16,16,16,16,16,14,14,0],"height":[0,14,16,16,16,16,16,14,14,0],"texture":[17.93,4,4,4,18,17,4,18]},"Main_rings3":{"section_segments":10,"offset":{"x":0,"y":-105,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-21,-18,-16,-14,-14,4,4,6,6,8],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,18,23,23,23,23,23,18,18,0],"height":[0,18,23,23,23,23,23,18,18,0],"texture":[17.93,4,4,4,1,17,4,18]}},"wings":{"sides":{"doubleside":true,"offset":{"x":10,"y":70,"z":-25},"length":[50,40,30],"width":[50,50,50,30],"angle":[0,90,135],"position":[-70,-50,-10,0],"texture":[4,13,63],"bump":{"position":20,"size":10}},"winglets1":{"doubleside":true,"offset":{"x":15,"y":70,"z":-5},"length":[50],"width":[50,20],"angle":[0],"position":[0,25],"texture":[63],"bump":{"position":10,"size":20}},"winglets2":{"doubleside":true,"offset":{"x":20,"y":100,"z":-5},"length":[35],"width":[50,20],"angle":[0],"position":[0,25],"texture":[63],"bump":{"position":10,"size":20}}},"typespec":{"name":"Reaper","level":6,"model":38,"code":638,"specs":{"shield":{"capacity":[450,450],"reload":[5,5]},"generator":{"capacity":[20,20],"reload":[500,500]},"ship":{"mass":700,"speed":[51,51],"rotation":[16,16],"acceleration":[100,100]}},"shape":[13.226,13.262,6.994,3.692,3.381,3.115,3.503,3.866,3.912,3.765,3.759,3.716,3.642,3.736,3.9,4.152,4.436,4.762,5.259,5.861,7.277,7.746,8.746,8.284,7.94,7.815,8.551,8.831,9.07,8.025,7.277,5.861,5.259,4.762,4.436,4.152,3.9,3.736,3.642,3.327,2.727,2.331,2.295,2.547,2.588,2.9,3.381,3.692,6.994,13.262],"lasers":[{"x":0,"y":-13.2,"z":1.02,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.72,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":10},{"x":-1.02,"y":-13.2,"z":0,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.72,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":10},{"x":0,"y":-13.2,"z":-1.02,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.72,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":1.02,"y":-13.2,"z":0,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":0.72,"y":-13.2,"z":0.72,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":0,"y":-13.2,"z":1.02,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.72,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":-1.02,"y":-13.2,"z":0,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":0,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":1,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":10},{"x":1.02,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":10},{"x":0.72,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":10},{"x":0,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":10},{"x":-1.02,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":3,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":3,"recoil":10},{"x":0,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":3,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":3,"recoil":10},{"x":1.02,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":3,"recoil":10},{"x":0.72,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":3,"recoil":10},{"x":0,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":4,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":4,"recoil":10},{"x":-1.02,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":4,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":5,"recoil":10},{"x":0,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":5,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":5,"recoil":10},{"x":1.02,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":6,"recoil":10},{"x":0.72,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":7,"recoil":10},{"x":0,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":6,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":6,"recoil":10},{"x":-1.02,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":7,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":7,"recoil":10},{"x":0,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":7,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":10},{"x":1.02,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":10},{"x":0.72,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":10},{"x":0,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":10},{"x":-1.02,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":8,"recoil":10},{"x":0,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":9,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":9,"recoil":10},{"x":1.02,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":9,"recoil":10},{"x":0.72,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":9,"recoil":10},{"x":0,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":10,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":10,"recoil":10},{"x":-1.02,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":10,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":10,"recoil":10},{"x":0,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":11,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":11,"recoil":10},{"x":1.02,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":11,"recoil":10},{"x":0.72,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":11,"recoil":10},{"x":0,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":12,"recoil":10},{"x":-0.72,"y":-13.2,"z":0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":13,"recoil":10},{"x":-1.02,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":5,"recoil":10},{"x":-0.72,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":15,"recoil":10},{"x":0,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":16,"recoil":10},{"x":0.72,"y":-13.2,"z":-0.9,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":17,"recoil":10},{"x":1.02,"y":-13.2,"z":-0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":18,"recoil":10},{"x":0.72,"y":-13.2,"z":0.3,"angle":0,"damage":[20,20],"rate":0.08,"type":1,"speed":[200,200],"number":1,"spread":0,"error":20,"recoil":10}],"radius":13.262}}'
        },
        name: "Shield",
        cooldown: 70 * 60,
        duration: 1,
        endOnDeath: true,

        showAbilityRangeUI: true,

        defencePodCode: 42,

        generatorInit: 0,

        range: 40,

        start: function (ship) {
            HelperFunctions.templates.start.call(this, ship);
            ship.emptyWeapons();
            HelperFunctions.spawnCollectibles(ship, Array(6).fill(this.defencePodCode));
            let targets = HelperFunctions.findEntitiesInRange(ship, this.range, true, false, { ships: true }, true);
            for (let target of targets) HelperFunctions.spawnCollectibles(target, Array(3).fill(this.defencePodCode));
        },

        end: function () {}
    },
    "Zeus": {
        models: {
            default: '{"name":"Zeus","designer":"nex","level":6,"model":39,"size":0.8,"specs":{"shield":{"capacity":[185,185],"reload":[6,6]},"generator":{"capacity":[170,170],"reload":[52,52]},"ship":{"mass":170,"speed":[130,130],"rotation":[85,85],"acceleration":[170,170]}},"tori":{"circle0":{"segments":8,"radius":50,"section_segments":4,"offset":{"x":0,"y":-65,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,15,15,15,15,15,15],"height":[8,8,8,8,8,8,8,8,8],"texture":[4]},"circle1":{"segments":8,"radius":40,"section_segments":4,"offset":{"x":0,"y":-130,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,15,15,15,15,15,15],"height":[5,5,5,5,5,5,5,5,5],"texture":[4]},"circle2":{"segments":8,"radius":30,"section_segments":4,"offset":{"x":0,"y":-195,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[12,12,12,12,12,12,12,12,12],"height":[4,4,4,4,4,4,4,4,4],"texture":[4]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-100,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-200,40,20,30,50,70,90,130,145,160,220,170],"z":[-15,-15,-15,-15,-15,-15,-10,0,0,0,0,0]},"width":[0,14,15,20,24,35,50,50,40,50,45,0],"height":[0,9,11,12,12,15,20,15,14,20,15,0],"texture":[17,4,3,4,4,4,11,4,4,8,17],"propeller":true,"laser":{"damage":[25,25],"rate":-1,"type":1,"speed":[280,280],"number":1,"error":0,"angle":0,"recoil":0}},"core":{"section_segments":12,"offset":{"x":70,"y":60,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-25,-30,-33,-80,-50,10,25,40,60,90,70],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,25,40,40,40,30,40,40,35,0],"height":[0,17,25,40,40,40,30,40,40,35,0],"texture":[5,55.9,18,3,10,4,4,2,13,17],"propeller":true},"cannon":{"section_segments":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-60,-10,7,35,55,70,90,120,110],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,7,8,14,18,12,12,20,20,0],"height":[0,7,8,14,18,12,12,20,20,0],"texture":[13,13,4,63,4,13,4,8,13],"propeller":false,"angle":0},"w":{"section_segments":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-60,-10,7,35,55,70,90,120,110],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,7,8,14,18,12,12,20,20,0],"height":[0,7,8,14,18,12,12,20,20,0],"texture":[13,13,4,63,4,13,4,8,13],"propeller":false,"angle":0}},"wings":{"outershields":{"offset":{"x":0,"y":-115,"z":0},"length":[45,-10,25,35],"width":[40,40,240,140,40],"angle":[0,-10,-10,-20],"position":[100,40,-30,30,50],"texture":[4,13,63],"doubleside":true,"bump":{"position":30,"size":20}},"innershields":{"offset":{"x":0,"y":-115,"z":0},"length":[25,-10,20],"width":[40,40,160,140],"angle":[0,0,0],"position":[100,40,30,-75],"texture":[63,13,2],"doubleside":true,"bump":{"position":30,"size":10}},"furthershields":{"offset":{"x":105,"y":100,"z":0},"length":[0,-10,20,30],"width":[40,40,250,200,40],"angle":[-30,-40,-20,-20],"position":[-20,40,-30,30,50],"texture":[4,17,4],"doubleside":true,"bump":{"position":30,"size":20}},"support_1":{"offset":{"x":0,"y":50,"z":0},"length":[0,80],"width":[0,90,25],"angle":[0,90],"position":[0,-100,-55],"texture":[4],"doubleside":true,"bump":{"position":0,"size":8}},"support_2":{"offset":{"x":0,"y":-100,"z":0},"length":[0,40],"width":[0,120,25],"angle":[0,90],"position":[0,-30,30],"texture":[63],"doubleside":true,"bump":{"position":0,"size":4}},"main":{"offset":{"x":25,"y":40,"z":0},"length":[80,30,35,45],"width":[120,80,100,165,50],"angle":[0,0,-40,-30],"position":[-20,60,90,150,80],"texture":[11,4,63,63],"doubleside":true,"bump":{"position":10,"size":15}},"main2":{"offset":{"x":25,"y":60,"z":0},"length":[50,30,35,45],"width":[120,80,100,165,50],"angle":[-70,-90,-20,-20],"position":[-20,60,90,150,90],"texture":[11,4,63,63],"doubleside":true,"bump":{"position":10,"size":15}}},"typespec":{"name":"Zeus","level":6,"model":39,"code":639,"specs":{"shield":{"capacity":[185,185],"reload":[6,6]},"generator":{"capacity":[170,170],"reload":[52,52]},"ship":{"mass":170,"speed":[130,130],"rotation":[85,85],"acceleration":[170,170]}},"shape":[4.8,4.277,3.708,2.887,2.493,2.275,2.12,2.016,1.83,1.781,1.732,1.789,1.774,1.815,1.913,2.076,3.663,3.965,4.175,4.481,4.93,5.071,4.427,4.831,1.954,1.924,1.954,4.831,4.427,5.071,4.93,4.481,4.175,3.965,3.663,2.076,1.913,1.815,1.774,1.789,1.732,1.781,1.83,2.016,2.12,2.275,2.493,2.887,3.708,4.277],"lasers":[{"x":0,"y":-4.8,"z":0.24,"angle":0,"damage":[25,25],"rate":-1,"type":1,"speed":[280,280],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.071}}'
        },
        name: "Launch",
        cooldown: 28 * 60,
        duration: 1,

        launchTimeout: 1.5 * 60,
        launchStrength: 3.845,

        endOnDeath: true,
        customEndcondition: true,
        
        range: 60 / 1.2,
        
        showAbilityRangeUI: true,
        includeRingOnModel: true,

        generatorInit: 0,

        start: function (ship) {
            ship.set({invulnerable: 200});
            let target = HelperFunctions.findEntitiesInRange(ship, this.range, false, true, { ships: true })[0];
            if (target != null) {
                HelperFunctions.accelerateToTarget(target, ship, 0.1, true);
                HelperFunctions.TimeManager.setTimeout(function () {
                    HelperFunctions.accelerate(target, this.launchStrength, ship.r)
                }.bind(this), this.launchTimeout);
            }
            ship.custom.forceEnd = true;
        }
    },
    "Piercer": {
        models: {
            default: '{"name":"Piercer","designer":"nex","level":6,"model":2,"size":1.85,"zoom":0.95,"specs":{"shield":{"capacity":[280,280],"reload":[7,7]},"generator":{"capacity":[10,10],"reload":[30,30]},"ship":{"mass":240,"speed":[80,80],"rotation":[45,45],"acceleration":[140,140]}},"bodies":{"main":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-30,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-95,-70,-40,-10,40,60,90,100,90],"z":[-10,-12,-8,-8,-8,-5,5,5,5,5]},"width":[0,25,20,20,20,22,24,24,20,0],"height":[0,5,15,15,20,20,20,20,15,0],"texture":[5,5,4,15.9,18,15.1,5],"propeller":0,"laser":{"damage":[500,500],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"angle":0,"recoil":0}},"rails":{"section_segments":4,"offset":{"x":8,"y":-30,"z":8},"position":{"x":[5,0,0,0,0,0,0],"y":[-105,-90,-60,-40,-10,40,60],"z":[0,0,0,2,3,6,20]},"width":[0,5,5,4,5,7,0],"height":[0,8,8,6,8,8,0],"texture":6,"propeller":false,"laser":{"damage":[4,10],"rate":2.5,"type":1,"speed":[60,160],"number":1,"error":0,"angle":0,"recoil":5}},"bow":{"section_segments":4,"offset":{"x":0,"y":-130,"z":2},"position":{"x":[-60,-50,-30,-15,-5,0,0,0,-5,-15,-30,-50,-60],"y":[-125,-120,-100,-70,-40,-10,0,10,40,70,100,120,125],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,12,12,13,15,10,15,13,12,12,10,0],"height":[0,10,12,12,13,15,10,15,13,12,12,10,0],"texture":[4,2,1,-1,6,4,4,6,-1,1,2,4],"propeller":false,"angle":90},"string":{"section_segments":4,"offset":{"x":0.1,"y":-73,"z":0},"position":{"x":[0,0],"y":[-120,0],"z":[0,17]},"width":[2,2],"height":[2,2],"texture":[49],"propeller":false,"angle":90},"scopeckpit":{"section_segments":12,"offset":{"x":0,"y":110,"z":37},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-75,-70,-35,-25,0,10,50,40],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,15,13,13,15,15,0],"height":[0,15,15,13,13,15,15,0],"texture":[9,15.1,2,13,2,15.1,17],"propeller":true},"propulsors":{"section_segments":8,"offset":{"x":20,"y":60,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-50,-48,-35,-10,0,10,30,60,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,14,14,10,14,14,14,0],"height":[0,24,28,28,20,28,28,28,0],"texture":[3,4,15.1,2,2,15.1,8,17],"propeller":true}},"wings":{"main":{"offset":{"x":25,"y":50,"z":2},"length":[20,30],"width":[70,40,15],"angle":[-20,0],"position":[20,40,50],"texture":[8,15.1],"doubleside":true,"bump":{"position":0,"size":15}},"support":{"offset":{"x":0,"y":-100,"z":-1},"length":[30,40],"width":[100,30,10],"angle":[0,0],"position":[20,0,-10],"texture":[2,15.6],"doubleside":true,"bump":{"position":0,"size":5}},"badge":{"offset":{"x":0,"y":70,"z":52},"length":[20],"width":[30,20],"angle":[-10],"position":[0,20],"texture":[63],"doubleside":true,"bump":{"position":20,"size":8}},"shields":{"offset":{"x":15,"y":-145,"z":2},"length":[10,30,30,0],"width":[0,15,15,8,0],"angle":[0,0,0,0],"position":[-4,0,5,18,18],"texture":[4,15.1,13,5],"doubleside":true,"bump":{"position":0,"size":200}}},"typespec":{"name":"Piercer","level":6,"model":2,"code":602,"specs":{"shield":{"capacity":[280,280],"reload":[7,7]},"generator":{"capacity":[10,10],"reload":[30,30]},"ship":{"mass":240,"speed":[80,80],"rotation":[45,45],"acceleration":[140,140]}},"shape":[5.357,5.719,5.781,5.825,5.774,5.778,5.555,5.55,5.515,0.631,0.595,0.576,0.566,0.569,0.583,1.277,1.388,1.551,1.721,1.971,4.824,4.728,4.47,4.615,5.946,5.932,5.946,4.615,4.47,4.728,4.824,1.971,1.721,1.551,1.388,1.277,0.583,0.569,0.566,0.576,0.595,0.631,5.515,5.55,5.555,5.778,5.774,5.825,5.781,5.719],"lasers":[{"x":0,"y":-4.625,"z":0.259,"angle":0,"damage":[500,500],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0},{"x":0.481,"y":-4.995,"z":0.296,"angle":0,"damage":[4,10],"rate":2.5,"type":1,"speed":[60,160],"number":1,"spread":0,"error":0,"recoil":5},{"x":-0.481,"y":-4.995,"z":0.296,"angle":0,"damage":[4,10],"rate":2.5,"type":1,"speed":[60,160],"number":1,"spread":0,"error":0,"recoil":5}],"radius":5.946}}',
            ability: '{"name":"Piercer","designer":"nex","level":5,"model":240,"size":1.85,"zoom":0.8,"specs":{"shield":{"capacity":[280,280],"reload":[3,3]},"generator":{"capacity":[500,500],"reload":[0.001,0.001]},"ship":{"mass":170,"speed":[65,65],"rotation":[20,20],"acceleration":[120,120]}},"bodies":{"main":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-30,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-95,-70,-40,-10,40,60,90,100,90],"z":[-10,-12,-8,-8,-8,-5,5,5,5,5]},"width":[0,25,20,20,20,22,24,24,20,0],"height":[0,5,15,15,20,20,20,20,15,0],"texture":[5,5,4,15.9,18,15.1,5],"propeller":0},"rails":{"section_segments":4,"offset":{"x":8,"y":-30,"z":8},"position":{"x":[5,0,0,0,0,0,0],"y":[-105,-90,-60,-40,-10,40,60],"z":[0,0,0,2,3,4,13]},"width":[0,5,5,4,5,7,0],"height":[0,8,8,6,8,8,0],"texture":6,"propeller":false},"bow":{"section_segments":4,"offset":{"x":0,"y":-130,"z":2},"position":{"x":[-120,-90,-55,-25,-10,0,0,0,-10,-25,-55,-90,-120],"y":[-115,-110,-90,-65,-40,-10,0,10,40,65,90,110,115],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,12,12,13,15,10,15,13,12,12,10,0],"height":[0,10,12,12,13,15,10,15,13,12,12,10,0],"texture":[4,2,1,-1,6,4,4,6,-1,1,2,4],"propeller":false,"angle":90},"arrow":{"section_segments":4,"offset":{"x":0,"y":35,"z":17},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-210,-170,-175,-30,-40,-20,0,10],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,5,5,7,12,12,0],"height":[0,15,5,5,10,12,11,0],"texture":[49,4,15.9,4,3],"propeller":false,"angle":0,"laser":{"damage":[9,9],"rate":1,"type":1,"speed":[650,650],"number":50,"error":0,"recoil":10}},"string":{"section_segments":4,"offset":{"x":0.1,"y":30,"z":2},"position":{"x":[0,0],"y":[-130,0],"z":[0,21]},"width":[2,2],"height":[2,2],"texture":[49],"propeller":false,"angle":55},"scopeckpit":{"section_segments":12,"offset":{"x":0,"y":110,"z":37},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-75,-70,-35,-25,0,10,50,40],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,15,13,13,15,15,0],"height":[0,15,15,13,13,15,15,0],"texture":[9,15.1,2,13,2,15.1,17],"propeller":true},"propulsors":{"section_segments":8,"offset":{"x":20,"y":60,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-50,-48,-35,-10,0,10,30,60,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,12,14,14,10,14,14,14,0],"height":[0,24,28,28,20,28,28,28,0],"texture":[3,4,15.1,2,2,15.1,8,17],"propeller":true}},"wings":{"main":{"offset":{"x":25,"y":50,"z":2},"length":[20,30],"width":[70,40,15],"angle":[-20,0],"position":[20,40,50],"texture":[8,15.1],"doubleside":true,"bump":{"position":0,"size":15}},"support":{"offset":{"x":0,"y":-100,"z":-1},"length":[30,40],"width":[100,30,10],"angle":[0,0],"position":[20,0,-10],"texture":[2,15.6],"doubleside":true,"bump":{"position":0,"size":5}},"badge":{"offset":{"x":0,"y":70,"z":52},"length":[20],"width":[30,20],"angle":[-10],"position":[0,20],"texture":[63],"doubleside":true,"bump":{"position":20,"size":8}},"arrowwings":{"offset":{"x":4,"y":5,"z":18},"length":[13],"width":[50,45],"angle":[30],"position":[0,20],"texture":[49],"doubleside":true,"bump":{"position":20,"size":8}},"shields":{"offset":{"x":15,"y":-140,"z":2},"length":[10,30,30,0],"width":[0,15,15,8,0],"angle":[0,0,0,0],"position":[-4,0,10,40,40],"texture":[4,15.1,13,5],"doubleside":true,"bump":{"position":0,"size":200}}},"typespec":{"name":"Piercer","level":5,"model":240,"code":740,"specs":{"shield":{"capacity":[280,280],"reload":[3,3]},"generator":{"capacity":[500,500],"reload":[0.001,0.001]},"ship":{"mass":170,"speed":[65,65],"rotation":[20,20],"acceleration":[120,120]}},"shape":[6.475,5.554,5.519,5.479,5.327,5.101,4.933,4.611,4.5,4.471,4.406,4.302,4.271,1.694,1.433,1.277,1.388,1.551,1.721,1.971,4.824,4.728,4.47,4.615,5.946,5.932,5.946,4.615,4.47,4.728,4.824,1.971,1.721,1.551,1.388,1.277,1.433,1.694,4.271,4.302,4.406,4.471,4.5,4.611,4.933,5.101,5.327,5.479,5.519,5.554],"lasers":[{"x":0,"y":-6.475,"z":0.629,"angle":0,"damage":[9,9],"rate":1,"type":1,"speed":[650,650],"number":50,"spread":0,"error":0,"recoil":10}],"radius":6.475}}'
        },
        name: "Reload",
        cooldown: 12 * 60,
        duration: 10 * 60,
        customEndcondition: true,
        cooldownRestartOnEnd: true,
        customInAbilityText: true,
        canStartOnAbility: true,
        endOnDeath: true,
        generatorInit: 0,

        endName: "Unload",

        canStart: function (ship) {
            return ship.custom.inAbility || HelperFunctions.templates.canStart.call(this, ship);
        },

        abilityName: function (ship) {
            return ship.custom.inAbility ? this.endName : this.name;
        },

        start: function (ship, lastStatus) {
            if (lastStatus) ship.custom.forceEnd = true;
            else ship.set({type:this.codes.ability,generator:500,stats:AbilityManager.maxStats});
        },

        tick: function (ship) {
            if (!ship.custom.forceEnd && ship.type == this.codes.ability && ship.generator < 500) ship.custom.forceEnd = true;
        }
    },
    "Megalodon": {
        models: {
            default: '{"name":"Megalodon","designer":"Nex","level":6,"model":41,"size":2.8,"specs":{"shield":{"capacity":[250,250],"reload":[7,7]},"generator":{"capacity":[230,230],"reload":[50,50]},"ship":{"mass":230,"speed":[115,115],"rotation":[80,80],"acceleration":[140,140]}},"bodies":{"thrustcannon":{"section_segments":6,"offset":{"x":20,"y":40,"z":-3},"position":{"x":[0,0,0,0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,2],"height":[0,2,2],"angle":180,"propeller":false,"texture":[3,3,10,3],"laser":{"damage":[15,15],"rate":1.7,"type":1,"speed":[200,200],"number":1,"error":0,"angle":180,"recoil":260}},"main":{"section_segments":8,"offset":{"x":0,"y":35,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-70,-65,-40,-25,-10,0,20,50,30],"z":[-8,-8,-1,0,0,0,0,0,0,0]},"width":[0,12,15,16,16,16,13,16,15,0],"height":[0,7,8,9,8,10,6,10,8,0],"texture":[17,18,4,11,1,4,4,8,17],"propeller":1,"laser":{"damage":[200,200],"rate":1,"type":2,"speed":[200,200],"number":1,"error":0,"angle":0,"recoil":0}},"upperjaw":{"section_segments":12,"offset":{"x":0,"y":-18,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-35,-35,-37,-40,-30,-25,-20],"z":[0,0,0,-5,2,0,0]},"width":[0,8,11,11,15,21,0],"height":[0,15,20,40,55,61,0],"texture":[63,17,13,4,3,1],"propeller":0,"angle":180,"vertical":true},"upperjaw2":{"section_segments":4,"offset":{"x":0,"y":65,"z":12},"position":{"x":[0,0,0,0,0,0,0],"y":[-114,-80,-65,-50,-35,-15,-20],"z":[0,0,0,0,0,0,0]},"width":[8,18,19,23,18,18,0],"height":[0,5,5,5,5,3,0],"texture":[3,2,1,3,11],"propeller":0},"lowerjaw":{"section_segments":4,"offset":{"x":0,"y":9,"z":-8},"position":{"x":[0,0,0,0,0,0,0],"y":[-82.5,-75,-60,-30,0,30,45],"z":[0,0,0,0,0,5,10]},"width":[0,15,16,17,17,16,0],"height":[0,5,6,6,7,7,0],"texture":[63,63,63,4,3],"propeller":0},"tongue":{"section_segments":12,"offset":{"x":0,"y":-31,"z":6},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-28,-25,-20],"z":[0,0,10,0,0]},"width":[0,10,16,17,0],"height":[0,30,50,60,0],"texture":[17,5],"propeller":0,"angle":180,"vertical":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":5,"z":-3},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[9],"propeller":false},"balls":{"section_segments":0,"offset":{"x":20,"y":65,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-55,-40,-20,-10,0,25,15],"z":[0,0,0,0,0,0,0,0]},"width":[0,14,15,15,10,15,12,0],"height":[0,14,15,15,10,15,13,0],"texture":[4,3,1,4,4,12,17],"propeller":0}},"wings":{"fin":{"offset":{"x":0,"y":0,"z":11},"length":[0,20,15],"width":[0,50,35,10],"angle":[90,90,90],"position":[0,0,25,60],"texture":[4],"doubleside":true,"bump":{"position":0,"size":10}},"topteeth":{"offset":{"x":18,"y":-20,"z":7},"length":[0,10],"width":[0,20,0],"angle":[-90,-90],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"topteeth1":{"offset":{"x":16,"y":-34,"z":7},"length":[0,10],"width":[0,20,0],"angle":[-90,-90],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"topteeth2":{"offset":{"x":11,"y":-47,"z":7},"length":[0,10],"width":[0,20,0],"angle":[-90,-90],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth":{"offset":{"x":18,"y":5,"z":-8},"length":[0,16],"width":[0,20,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth1":{"offset":{"x":17,"y":-10,"z":-8},"length":[0,16],"width":[0,20,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth2":{"offset":{"x":16,"y":-25,"z":-8},"length":[0,16],"width":[0,20,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth3":{"offset":{"x":15,"y":-40,"z":-8},"length":[0,16],"width":[0,20,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth4":{"offset":{"x":14,"y":-55,"z":-8},"length":[0,16],"width":[0,20,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth5":{"offset":{"x":3,"y":-70,"z":-5},"length":[0,16],"width":[0,12,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":15}},"teeth6":{"offset":{"x":10,"y":-65,"z":-5},"length":[0,16],"width":[0,12,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":15}},"nekotonihonraamen":{"offset":{"x":33,"y":25,"z":-18},"length":[20,16],"width":[0,50,20],"angle":[130,30],"position":[0,10,30],"texture":[4,63],"doubleside":true,"bump":{"position":0,"size":15}},"tail1":{"offset":{"x":0,"y":65,"z":-33},"length":[40,20,15],"width":[10,40,30,0],"angle":[90,90,90],"position":[30,-5,20,60],"texture":[63],"doubleside":true,"bump":{"position":0,"size":16}}},"typespec":{"name":"Megalodon","level":6,"model":41,"code":641,"specs":{"shield":{"capacity":[250,250],"reload":[7,7]},"generator":{"capacity":[230,230],"reload":[50,50]},"ship":{"mass":230,"speed":[115,115],"rotation":[80,80],"acceleration":[140,140]}},"shape":[4.259,4.073,3.824,2.898,2.397,1.999,1.728,1.546,1.421,1.328,1.253,1.186,1.144,1.133,1.197,1.279,1.419,2.113,2.404,2.714,3.545,4.108,3.929,4.522,4.834,7,4.834,4.522,3.929,4.108,3.545,2.714,2.404,2.113,1.419,1.279,1.197,1.133,1.144,1.186,1.253,1.328,1.421,1.546,1.728,1.999,2.397,2.898,3.824,4.073],"lasers":[{"x":1.12,"y":2.8,"z":-0.168,"angle":180,"damage":[15,15],"rate":1.7,"type":1,"speed":[200,200],"number":1,"spread":180,"error":0,"recoil":260},{"x":-1.12,"y":2.8,"z":-0.168,"angle":-180,"damage":[15,15],"rate":1.7,"type":1,"speed":[200,200],"number":1,"spread":180,"error":0,"recoil":260},{"x":0,"y":-1.96,"z":0.28,"angle":0,"damage":[200,200],"rate":1,"type":2,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":7}}',
            ability: '{"name":"Megalodon","designer":"Nex","level":7,"model":99,"size":4.2,"specs":{"shield":{"capacity":[600,600],"reload":[20,20]},"generator":{"capacity":[350,350],"reload":[90,90]},"ship":{"mass":525,"speed":[120,120],"rotation":[38,38],"acceleration":[155,155]}},"bodies":{"thrustcannon":{"section_segments":6,"offset":{"x":20,"y":40,"z":-3},"position":{"x":[0,0,0,0,0,0],"y":[-10,0,10],"z":[0,0,0]},"width":[0,2,2],"height":[0,2,2],"angle":180,"propeller":false,"texture":[3,3,10,3],"laser":{"damage":[50,50],"rate":1,"type":1,"speed":[200,200],"number":1,"error":0,"angle":180,"recoil":500}},"main":{"section_segments":8,"offset":{"x":0,"y":20,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-70,-65,-40,-25,-10,0,10,40,30,55,80,120],"z":[-8,-8,-1,0,0,0,0,0,0,0,3,6,0]},"width":[0,12,15,16,16,16,13,16,15,14,11,8,0],"height":[0,7,8,9,8,10,6,10,8,7,6,3,0],"texture":[17,18,4,11,1,4,4,8,3,2,3,4],"propeller":false,"laser":{"damage":[175,175],"rate":1,"type":1,"speed":[250,250],"number":2,"error":0,"angle":0,"recoil":0}},"upperjaw":{"section_segments":12,"offset":{"x":0,"y":-16,"z":25},"position":{"x":[0,0,0,0,0,0,0],"y":[-35,-35,-37,-37,-30,-25,-20],"z":[0,0,0,0,0,0,0]},"width":[0,8,11,11,16,23,0],"height":[0,15,20,40,60,55,0],"texture":[63,17,13,4,3,1],"propeller":0,"angle":180,"vertical":true,"laser":{"damage":[350,350],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"angle":0,"recoil":0}},"upperjaw2":{"section_segments":4,"offset":{"x":1,"y":40,"z":14},"position":{"x":[0,0,0,0,0,0,0],"y":[-124,-80,-65,-45,-20,0,-10],"z":[0,0,0,0,0,0,0]},"width":[0,17,20,26,18,18,0],"height":[0,5,5,5,5,3,0],"texture":[3,2,1,3,11],"propeller":0},"lowerjaw":{"section_segments":4,"offset":{"x":0,"y":-25,"z":-6},"position":{"x":[0,0,0,0,0,0,0],"y":[-92.5,-75,-60,-30,0,30,45],"z":[0,0,0,0,0,5,10]},"width":[0,17,20,23,22,16,0],"height":[0,5,6,6,7,7,0],"texture":[63,63,63,4,3],"propeller":0},"tongue":{"section_segments":12,"offset":{"x":0,"y":-29,"z":41},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-28,-25,-20],"z":[0,0,10,0,0]},"width":[0,13,19,17,0],"height":[0,30,55,60,0],"texture":[17,5],"propeller":0,"angle":180,"vertical":true},"balls":{"section_segments":4,"offset":{"x":20,"y":35,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-55,-40,-20,-10,0,25,15],"z":[0,0,0,0,0,0,0,0]},"width":[0,14,15,15,10,15,12,0],"height":[0,14,15,15,10,15,13,0],"texture":[4,3,1,4,4,12,17],"propeller":1}},"wings":{"fin":{"offset":{"x":0,"y":-10,"z":13},"length":[0,20,15],"width":[0,50,35,10],"angle":[90,90,90],"position":[0,0,25,60],"texture":[4],"doubleside":true,"bump":{"position":0,"size":15}},"topteeth":{"offset":{"x":18,"y":-35,"z":9},"length":[0,10],"width":[0,20,0],"angle":[-90,-90],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"topteeth1":{"offset":{"x":16,"y":-49,"z":9},"length":[0,10],"width":[0,20,0],"angle":[-90,-90],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"topteeth2":{"offset":{"x":11,"y":-62,"z":9},"length":[0,10],"width":[0,20,0],"angle":[-90,-90],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth":{"offset":{"x":18,"y":-30,"z":-6},"length":[0,16],"width":[0,20,0],"angle":[90,80],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth1":{"offset":{"x":22,"y":-45,"z":-6},"length":[0,19],"width":[0,20,0],"angle":[90,75],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth2":{"offset":{"x":22,"y":-60,"z":-6},"length":[0,19],"width":[0,20,0],"angle":[90,75],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth3":{"offset":{"x":20,"y":-75,"z":-6},"length":[0,19],"width":[0,20,0],"angle":[90,75],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth4":{"offset":{"x":17,"y":-90,"z":-6},"length":[0,19],"width":[0,20,0],"angle":[90,75],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":8}},"teeth5":{"offset":{"x":3,"y":-110,"z":-3},"length":[0,19],"width":[0,12,0],"angle":[90,75],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":15}},"teeth6":{"offset":{"x":11,"y":-103,"z":-3},"length":[0,19],"width":[0,12,0],"angle":[90,75],"position":[0,0,0],"texture":[49],"doubleside":true,"bump":{"position":0,"size":15}},"nekotonihonraamen":{"offset":{"x":42,"y":30,"z":-16},"length":[40,25],"width":[0,50,20],"angle":[130,30],"position":[0,10,40],"texture":[4,63],"doubleside":true,"bump":{"position":0,"size":15}},"tail1":{"offset":{"x":0,"y":124,"z":-28},"length":[40,20,15],"width":[10,40,30,0],"angle":[90,90,90],"position":[30,-5,20,45],"texture":[63],"doubleside":true,"bump":{"position":0,"size":16}}},"typespec":{"name":"Megalodon","level":7,"model":99,"code":799,"specs":{"shield":{"capacity":[600,600],"reload":[20,20]},"generator":{"capacity":[350,350],"reload":[90,90]},"ship":{"mass":525,"speed":[120,120],"rotation":[38,38],"acceleration":[155,155]}},"shape":[9.87,9.349,8.287,6.679,4.728,3.502,2.979,3.08,3.313,3.264,3.108,3.012,2.963,2.963,3.032,3.16,3.199,4.336,4.363,4.504,5.88,7.437,7.38,6.108,8.955,14.196,8.955,6.108,7.38,7.437,5.88,4.504,4.363,4.336,3.199,3.16,3.032,2.963,2.963,3.012,3.108,3.264,3.313,3.08,2.979,3.502,4.728,6.679,8.287,9.349],"lasers":[{"x":1.68,"y":4.2,"z":-0.252,"angle":180,"damage":[50,50],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":180,"error":0,"recoil":500},{"x":-1.68,"y":4.2,"z":-0.252,"angle":-180,"damage":[50,50],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":180,"error":0,"recoil":500},{"x":0,"y":-4.2,"z":0.588,"angle":0,"damage":[175,175],"rate":1,"type":1,"speed":[250,250],"number":2,"spread":0,"error":0,"recoil":0},{"x":0,"y":1.764,"z":2.1,"angle":180,"damage":[350,350],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0}],"radius":14.196}}'
        },
        name: "Evolve",
        duration: 60 * 60,
        cooldownRestartOnEnd: true,
        customInAbilityText: true,

        killsRequired: 3,

        requirementsText: function (ship) {
            return ship.custom.inAbility ? HelperFunctions.timeLeft(ship.custom.lastTriggered + this.duration) : `${ship.custom.abilityCustom.kills || 0}/${this.killsRequired} kills`;
        },

        canStart: function (ship) {
            return !ship.custom.inAbility && ship.custom.abilityCustom.kills >= this.killsRequired;
        },

        start: function (ship) {
            ship.set({generator:1000,type:this.codes.ability,stats: AbilityManager.maxStats,invulnerable:100});
            this.unload(ship);
        },

        event: function (event, ship) {
            if (event.name == "ship_destroyed") {
                if (event.killer === ship && !ship.custom.inAbility) ship.custom.abilityCustom.kills = (ship.custom.abilityCustom.kills || 0) + 1;
                if (event.ship === ship) ship.custom.abilityCustom.kills = 0;
            }
        },

        reload: function (ship) {
            ship.custom.abilityCustom.kills = this.killsRequired;
        },

        unload: function (ship) {
            ship.custom.abilityCustom.kills = 0;
        }

    },
    "Shadow X-2": {
        models: {
            default: '{"name":"Shadow X-2","remodel":"nex","level":6,"model":42,"size":1.22,"zoom":0.8,"specs":{"shield":{"capacity":[215,225],"reload":[13,15]},"generator":{"capacity":[125,165],"reload":[25,35]},"ship":{"mass":135,"speed":[130,170],"rotation":[35,55],"acceleration":[145,165]}},"bodies":{"main":{"section_segments":7,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-98,-95,-70,-10,0,40,50,70,90,100],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,8,20,30,18,18,30,30,35,35,0],"height":[0,4,4,10,15,10,10,20,15,15,10,10],"texture":[12,4,63,4,5,63,5,4,5]},"back":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,100,105,90],"z":[0,0,0,0,0]},"width":[10,15,18,30,2],"height":[3,5,7,8,2],"texture":[63,63,63,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-25,"z":9},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-20,0,5],"z":[0,0,0,0,0,0]},"width":[0,4,10,15,0],"height":[0,8,15,5,0],"texture":[9]},"laser":{"section_segments":10,"offset":{"x":40,"y":5,"z":-16},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-20,-25,0,10,20,25,30,50,80,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,15,18,18,18,10,10,18,14,0],"height":[0,8,15,18,20,18,10,10,18,14,0],"texture":[6,17,4,10,3,4,3,4,15,17],"propeller":true,"angle":0.6,"laser":{"damage":[8,8],"rate":10,"type":1,"speed":[350,350],"number":1,"error":0}}},"wings":{"top":{"doubleside":true,"offset":{"x":10,"y":80,"z":5},"length":[30],"width":[50,30],"angle":[60],"position":[0,50],"texture":[3],"bump":{"position":10,"size":10}},"side":{"doubleside":true,"offset":{"x":10,"y":80,"z":5},"length":[30],"width":[70,20],"angle":[-13],"position":[0,60],"texture":[63],"bump":{"position":10,"size":10}},"wings":{"offset":{"x":10,"y":40,"z":3},"length":[37,40],"width":[120,90,50],"angle":[0,0],"position":[-65,15,80],"texture":[15.4,4],"bump":{"position":-10,"size":10}},"wings2":{"offset":{"x":15,"y":110,"z":13},"length":[40],"width":[70,50],"angle":[0],"position":[-50,-10],"texture":[3],"bump":{"position":0,"size":15}}},"typespec":{"name":"Shadow X-2","level":6,"model":42,"code":642,"specs":{"shield":{"capacity":[215,225],"reload":[13,15]},"generator":{"capacity":[125,165],"reload":[25,35]},"ship":{"mass":135,"speed":[130,170],"rotation":[35,55],"acceleration":[145,165]}},"shape":[2.44,2.348,1.969,1.613,1.347,1.204,1.112,1.289,1.25,1.333,1.406,1.379,1.378,1.405,1.441,1.503,1.586,1.935,2.516,3.327,3.96,4.116,3.322,3.783,3.59,2.567,3.59,3.783,3.322,4.116,3.96,3.327,2.516,1.935,1.586,1.503,1.441,1.405,1.378,1.379,1.406,1.333,1.25,1.289,1.112,1.204,1.347,1.613,1.969,2.348],"lasers":[{"x":0.966,"y":-0.854,"z":-0.39,"angle":0.6,"damage":[8,8],"rate":10,"type":1,"speed":[350,350],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.966,"y":-0.854,"z":-0.39,"angle":-0.6,"damage":[8,8],"rate":10,"type":1,"speed":[350,350],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.116}}',
            ability: '{"name":"Shadow X-3","remodel":"Nex","level":7,"model":42,"size":2.5,"zoom":0.8,"specs":{"shield":{"capacity":[455,455],"reload":[15,15]},"generator":{"capacity":[282,282],"reload":[63,63]},"ship":{"mass":420,"speed":[142,142],"rotation":[38,38],"acceleration":[115,115]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-132,-130,-120,-70,-40,0,40,70,80,90,100],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,20,20,20,20,30,30,30,20,0],"height":[0,5,10,30,25,10,10,15,15,15,10,10],"texture":[12,15.3,15,15.3,63,63,15.3,15.3,5],"laser":{"damage":[250,250],"rate":1,"type":2,"speed":[350,350],"number":1,"error":0,"recoil":500}},"air":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,-100,-30,-10,10,60,90],"z":[0,0,0,0,0,0,0]},"width":[0,20,35,30,30,35,25],"height":[0,8,10,10,10,10,10,15,15,15,10,10],"texture":[15.3,3,2,15.3,3,3]},"back":{"section_segments":12,"offset":{"x":0,"y":-5,"z":0},"position":{"x":[0,0,0,0,0],"y":[50,40,90,115,90],"z":[0,0,0,0,0]},"width":[10,25,20,25,0],"height":[10,10,10,10,0],"texture":[15.3,8,8],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-25,0,25,40,70,90,120],"z":[0,0,0,-5,-7,-10,-8,-8]},"width":[0,8,13,10,15,20,14,15],"height":[0,15,23,15,10,10,10,5],"texture":[7,9,9,15.3,10,63,4]},"laser":{"section_segments":10,"offset":{"x":80,"y":10,"z":-14},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-20,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,10,15,15,15,10,10,15,12,0],"height":[0,6,10,15,15,15,10,10,15,5,0],"texture":[6,17,4,10,3,2,4,2,12,17],"propeller":true,"angle":1.5,"laser":{"damage":[8,8],"rate":5,"type":1,"speed":[260,260],"number":1}},"laser2":{"section_segments":10,"offset":{"x":45,"y":-25,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-20,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,10,15,15,15,10,10,15,12,0],"height":[0,6,10,15,15,15,10,10,15,5,0],"texture":[6,17,4,10,3,4,5,4,3,17],"propeller":true,"angle":1,"laser":{"damage":[8,8],"rate":6,"type":1,"speed":[280,280],"number":1}}},"wings":{"wings":{"offset":{"x":10,"y":0,"z":0},"length":[35,25,15,15,10],"width":[110,60,60,50,40,30],"angle":[-10,20,0,-20,-50],"position":[0,-15,30,40,25,-5],"texture":[15.3,63,15.3,15.3,15.3],"bump":{"position":-20,"size":15}}},"typespec":{"name":"Shadow X-3","level":7,"model":42,"code":742,"specs":{"shield":{"capacity":[455,455],"reload":[15,15]},"generator":{"capacity":[282,282],"reload":[63,63]},"ship":{"mass":420,"speed":[142,142],"rotation":[38,38],"acceleration":[115,115]}},"shape":[6.6,6.227,4.842,3.678,3.014,3.933,3.669,3.688,3.463,3.302,4.223,5.27,5.214,5.198,5.192,5.278,5.422,5.809,6.132,5.833,2.929,3.465,4.759,5.64,5.599,5.511,5.599,5.64,4.759,3.465,2.929,5.833,6.132,5.809,5.422,5.278,5.192,5.198,5.214,5.27,4.223,3.302,3.463,3.688,3.669,3.933,3.014,3.678,4.842,6.227],"lasers":[{"x":0,"y":-6.6,"z":0,"angle":0,"damage":[250,250],"rate":1,"type":2,"speed":[350,350],"number":1,"spread":0,"error":0,"recoil":500},{"x":3.948,"y":-1.499,"z":-0.7,"angle":1.5,"damage":[8,8],"rate":5,"type":1,"speed":[260,260],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.948,"y":-1.499,"z":-0.7,"angle":-1.5,"damage":[8,8],"rate":5,"type":1,"speed":[260,260],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.215,"y":-3.25,"z":-0.25,"angle":1,"damage":[8,8],"rate":6,"type":1,"speed":[280,280],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.215,"y":-3.25,"z":-0.25,"angle":-1,"damage":[8,8],"rate":6,"type":1,"speed":[280,280],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.6}}'
        },
        name: "Revolve",
        duration: 35 * 60,
        cooldown: 70 * 60,

        endOnDeath: true,
        cooldownRestartOnEnd: true,
        customInAbilityText: true,

        generatorInit: 0,

        requirementsText: function (ship) {
            return ship.custom.inAbility ? HelperFunctions.timeLeft(ship.custom.lastTriggered + this.duration) : HelperFunctions.templates.requirementsText.call(this, ship);
        }
    },
    "Chimera": {
        models: {
            default: '{"name":"Chimera","level":6,"model":43,"size":1.8,"zoom":0.8,"specs":{"shield":{"capacity":[260,315],"reload":[8,10]},"generator":{"capacity":[190,250],"reload":[47,47]},"ship":{"mass":238,"speed":[90,110],"rotation":[40,62],"acceleration":[90,125]}},"bodies":{"rail1":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[-10,-15,-15,0,0,0,0,0],"y":[-117,-105,-60,0,70,105,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,5,25,25,15,0],"height":[0,10,15,20,25,15,0],"propeller":false,"texture":[63,3,18,11,3,12]},"side_propulsors":{"section_segments":10,"offset":{"x":22,"y":17,"z":9.8},"position":{"x":[0,0,0,0,0,0,0,0,-5,-5],"y":[-20,-15,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,18,20,13,15,18,10,0],"height":[0,10,15,18,20,13,15,18,10,0],"propeller":true,"texture":[4,4,2,2,5,63,5,4,12]},"rail2":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[10,15,15,0,0,0,0,0],"y":[-117,-105,-60,0,70,105,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,5,25,25,15,0],"height":[0,10,15,20,25,15,0],"propeller":true,"texture":[63,3,18,11,3,12]},"gunDeco0":{"vertical":true,"section_segments":24,"offset":{"x":2,"y":-5,"z":101},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco1":{"vertical":true,"section_segments":24,"offset":{"x":2,"y":-5,"z":90},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco2":{"vertical":true,"section_segments":24,"offset":{"x":2,"y":-5,"z":79},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco3":{"vertical":true,"section_segments":24,"offset":{"x":2,"y":-5,"z":68},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco4":{"vertical":true,"section_segments":24,"offset":{"x":2,"y":-5,"z":57},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"railCells":{"vertical":true,"section_segments":8,"offset":{"x":0,"y":10,"z":35},"position":{"x":[0,0,0,0],"y":[0,0,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"propeller":false,"texture":[8,8,17,17]},"sparkGuns":{"section_segments":8,"offset":{"x":15,"y":-90,"z":10},"position":{"x":[0,0,0,0],"y":[0,0,10,9],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"angle":90,"propeller":false,"texture":[8,8,17,17],"laser":{"damage":[1,2],"rate":10,"type":2,"speed":[10,20],"number":5,"error":65}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":5,"z":25},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,45,70],"z":[0,0,0,0,1]},"width":[0,8,12,13,0],"height":[0,12,15,12,0],"propeller":false,"texture":[4,9,9,4]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-10,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-43,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[3,6],"speed":[150,210],"rate":1.69,"type":1,"number":30,"recoil":8,"error":0},"propeller":false,"texture":[17,3,3,3,3,3]},"indicator":{"section_segments":8,"offset":{"x":0,"y":-10,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-43,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[90,180],"speed":[150,210],"rate":1.69,"type":2,"number":105,"recoil":8,"error":0},"propeller":false,"texture":[17,3,3,3,3,3]},"deco":{"section_segments":8,"offset":{"x":45,"y":50,"z":-10},"position":{"x":[0,0,5,5,0,0],"y":[-52,-50,-20,0,20,25],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,8,10,8,0],"angle":1,"laser":{"damage":[4,8],"rate":5,"type":1,"speed":[100,150],"number":1,"error":0},"texture":10}},"wings":{"main":{"length":[55,15],"width":[70,50,50],"angle":[-10,20],"position":[30,50,70],"doubleside":true,"bump":{"position":30,"size":10},"texture":[18,63],"offset":{"x":0,"y":0,"z":5}},"winglets":{"length":[12,8],"width":[20,15,65],"angle":[10,-10],"position":[-50,-40,-55],"doubleside":true,"bump":{"position":0,"size":30},"texture":63,"offset":{"x":12,"y":0,"z":5}},"stab1":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":0,"y":0,"z":0}},"stab2":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":-5,"y":-30,"z":0}},"stab3":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":-10,"y":-60,"z":0}}},"typespec":{"name":"Chimera","level":6,"model":43,"code":643,"specs":{"shield":{"capacity":[260,315],"reload":[8,10]},"generator":{"capacity":[190,250],"reload":[47,47]},"ship":{"mass":238,"speed":[90,110],"rotation":[40,62],"acceleration":[90,125]}},"shape":[3.737,4.227,3.832,3.35,2.68,2.125,1.784,1.562,1.403,0.974,0.931,0.908,1.769,1.867,2.004,2.211,2.451,3.035,3.369,3.855,4.211,3.319,3.535,3.62,3.818,3.787,3.818,3.62,3.535,3.319,4.211,3.855,3.369,3.035,2.451,2.211,2.004,1.867,1.769,0.908,0.931,0.974,1.403,1.562,1.784,2.125,2.68,3.35,3.832,4.227],"lasers":[{"x":0.54,"y":-3.24,"z":0.36,"angle":90,"damage":[1,2],"rate":10,"type":2,"speed":[10,20],"number":5,"spread":0,"error":65,"recoil":0},{"x":-0.54,"y":-3.24,"z":0.36,"angle":-90,"damage":[1,2],"rate":10,"type":2,"speed":[10,20],"number":5,"spread":0,"error":65,"recoil":0},{"x":0,"y":-2.16,"z":0.36,"angle":0,"damage":[3,6],"rate":1.69,"type":1,"speed":[150,210],"number":30,"spread":0,"error":0,"recoil":8},{"x":0,"y":-2.16,"z":0.36,"angle":0,"damage":[90,180],"rate":1.69,"type":2,"speed":[150,210],"number":105,"spread":0,"error":0,"recoil":8},{"x":1.587,"y":-0.072,"z":-0.36,"angle":1,"damage":[4,8],"rate":5,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.587,"y":-0.072,"z":-0.36,"angle":-1,"damage":[4,8],"rate":5,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.227}}',
            ability: '{"name":"Chimera","level":7,"model":43,"size":1.8,"zoom":0.8,"specs":{"shield":{"capacity":[315,315],"reload":[10,10]},"generator":{"capacity":[500,500],"reload":[200,200]},"ship":{"mass":220,"speed":[110,110],"rotation":[62,62],"acceleration":[125,125]}},"bodies":{"rail1":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[-30,-35,-35,0,0,0,0,0],"y":[-117,-105,-60,0,70,105,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,5,25,25,15,0],"height":[0,10,15,20,25,15,0],"propeller":false,"texture":[63,3,18,11,3,12],"laser":{"damage":[400,400],"rate":1,"type":2,"speed":[1,1],"number":100,"error":0,"recoil":0}},"side_propulsors":{"section_segments":10,"offset":{"x":22,"y":17,"z":9.8},"position":{"x":[0,0,0,0,0,0,0,0,-5,-5],"y":[-20,-15,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,18,20,13,15,18,10,0],"height":[0,10,15,18,20,13,15,18,10,0],"propeller":true,"texture":[4,4,2,2,5,63,5,4,12]},"rail2":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[30,35,35,0,0,0,0,0],"y":[-117,-105,-60,0,70,105,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,5,25,25,15,0],"height":[0,10,15,20,25,15,0],"propeller":true,"texture":[63,3,18,11,3,12]},"gunDeco0":{"vertical":true,"section_segments":24,"offset":{"x":22,"y":-5,"z":101},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco1":{"vertical":true,"section_segments":24,"offset":{"x":22,"y":-5,"z":90},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco2":{"vertical":true,"section_segments":24,"offset":{"x":22,"y":-5,"z":79},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco3":{"vertical":true,"section_segments":24,"offset":{"x":22,"y":-5,"z":68},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"gunDeco4":{"vertical":true,"section_segments":24,"offset":{"x":22,"y":-5,"z":57},"position":{"x":[0,10,10,0],"y":[0,10,20,30],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"propeller":false,"texture":[17,17,17,17]},"railCells":{"vertical":true,"section_segments":8,"offset":{"x":0,"y":10,"z":35},"position":{"x":[0,0,0,0],"y":[0,0,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"propeller":false,"texture":[8,8,17,17]},"sparkGuns":{"section_segments":8,"offset":{"x":35,"y":-90,"z":10},"position":{"x":[0,0,0,0],"y":[0,0,10,9],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"angle":90,"propeller":false,"texture":[8,8,17,17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":5,"z":25},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,45,70],"z":[0,0,0,0,1]},"width":[0,8,12,13,0],"height":[0,12,15,12,0],"propeller":false,"texture":[4,9,9,4]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-10,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-43,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,13,15,10,15,0],"height":[0,10,15,15,10,0],"angle":0,"laser":{"damage":[40,40],"speed":[200,200],"rate":1.69,"type":1,"number":10,"recoil":10,"error":0},"propeller":false,"texture":[17,3,3,3,3,3]},"deco":{"section_segments":8,"offset":{"x":45,"y":50,"z":-10},"position":{"x":[0,0,5,5,0,0],"y":[-52,-50,-20,0,20,25],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,5,0],"height":[0,5,8,10,8,0],"angle":1}},"wings":{"main":{"length":[55,15],"width":[70,50,50],"angle":[-10,20],"position":[30,50,70],"doubleside":true,"bump":{"position":30,"size":10},"texture":[18,63],"offset":{"x":0,"y":0,"z":5}},"winglets":{"length":[12,8],"width":[20,15,65],"angle":[10,-10],"position":[-50,-40,-55],"doubleside":true,"bump":{"position":0,"size":30},"texture":63,"offset":{"x":32,"y":0,"z":5}},"stab1":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":0,"y":0,"z":0}},"stab2":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":-5,"y":-30,"z":0}},"stab3":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":-10,"y":-60,"z":0}}},"typespec":{"name":"Chimera","level":7,"model":43,"code":743,"specs":{"shield":{"capacity":[315,315],"reload":[10,10]},"generator":{"capacity":[500,500],"reload":[200,200]},"ship":{"mass":220,"speed":[110,110],"rotation":[62,62],"acceleration":[125,125]}},"shape":[2.164,2.199,4.348,4.166,3.803,3.459,2.91,2.552,2.298,2.123,1.07,0.988,1.769,1.867,2.004,2.211,2.451,3.035,3.369,3.855,4.211,3.319,3.535,3.62,3.818,3.787,3.818,3.62,3.535,3.319,4.211,3.855,3.369,3.035,2.451,2.211,2.004,1.867,1.769,0.988,1.07,2.123,2.298,2.552,2.91,3.459,3.803,4.166,4.348,2.199],"lasers":[{"x":-1.08,"y":-4.212,"z":0.36,"angle":0,"damage":[400,400],"rate":1,"type":2,"speed":[1,1],"number":100,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.16,"z":0.36,"angle":0,"damage":[40,40],"rate":1.69,"type":1,"speed":[200,200],"number":10,"spread":0,"error":0,"recoil":10}],"radius":4.348}}'
        },
        name: "Overload",
        cooldown: 30 * 60,
        duration: 4 * 60,
        endOnDeath: true,

        generatorInit: 0,

        end: function (ship) {
            HelperFunctions.templates.end.call(this, ship);
            ship.set({ generator: this.energy_capacities.default });
        }
    },
    // Season 3 + Remake
    "Valence": {
        models: {
            default: '{"name":"Valence-2","level":6,"model":45,"size":1.8,"zoom":0.85,"specs":{"shield":{"capacity":[270,270],"reload":[8.5,8.5]},"generator":{"capacity":[240,240],"reload":[60,60]},"ship":{"mass":200,"speed":[175,175],"rotation":[110,110],"acceleration":[120,120]}},"bodies":{"body_main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-110,-107,-64,-49,-30,-15,5,25,40,35],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,20,18,19,20,22,21,20,0],"height":[0,5,15,19,22,24,24,24,24,27,0],"texture":[63,2,2,13,3,4,18,12,17],"propeller":true},"body_cockpit":{"section_segments":6,"offset":{"x":0,"y":-80,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-15,-10,5,16,24,36,48,50,57],"z":[-3,0,0,0,0,0,3,5,5]},"width":[0,6,11,13,12,11,10,10,0],"height":[0,2,9,12,13,14,14,13,0],"texture":[9,9,9,4,63,4,4],"propeller":false},"cannons_front":{"section_segments":12,"offset":{"x":62,"y":-59,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-45,-28,-23,-10,5,20,30,38,41,38],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,9,11,11,11,11,9,8,0],"height":[0,2,8,10,10,10,10,9,8,0],"angle":2.1,"laser":{"damage":[15,15],"rate":4,"type":1,"speed":[220,220],"number":1,"angle":0,"error":0},"propeller":true,"texture":[6,3,12,4,8,4,13,2,17]},"cannons_back":{"section_segments":12,"offset":{"x":40,"y":50,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-45,-40,-29,-10,0,10,5],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,11,13,13,11,9,0],"height":[0,3,11,13,13,11,9,0],"texture":[6,12,4,8,4,13,17],"propeller":true,"angle":1.4,"laser":{"damage":[15,15],"rate":4,"type":1,"speed":[220,220],"number":1,"angle":0,"error":0}}},"wings":{"wings_primary_outer":{"offset":{"x":0,"y":0,"z":-13},"length":[30,30,5],"width":[80,75,65,65],"texture":[3,4,4],"angle":[0,0,0],"position":[0,-20,-50,-82],"doubleside":true,"bump":{"position":-35,"size":5}},"wing_primary_inner":{"offset":{"x":0,"y":-83.5,"z":-6},"length":[20,25,15],"width":[60,50,35,30],"angle":[0,0,0],"position":[80,69,48,36],"texture":[4,8,3],"doubleside":true,"bump":{"position":10,"size":0}},"wings_back":{"offset":{"x":0,"y":0,"z":15},"length":[45],"width":[40,20],"angle":[10],"position":[5,45],"texture":[63],"doubleside":true,"bump":{"position":-3,"size":10}},"winglet_body_outline":{"offset":{"x":6,"y":-83,"z":0},"length":[20,15],"width":[65,10],"texture":[63],"angle":[0,0],"position":[-15,20],"doubleside":true,"bump":{"size":0}},"winglets_cannon_front":{"offset":{"x":70,"y":-34,"z":-5},"length":[20],"width":[54,0],"angle":[35],"position":[-10,29],"texture":[63],"doubleside":true,"bump":{"position":10,"size":5}},"winglets_cannon_back":{"offset":{"x":51,"y":47,"z":25},"length":[20],"width":[44,0],"angle":[35],"position":[-10,29],"texture":[63],"doubleside":true,"bump":{"position":10,"size":5}},"connector_cannon_front_body":{"offset":{"x":0,"y":-54,"z":15},"length":[60],"width":[24,12],"angle":[-15],"position":[50,9],"texture":[63],"doubleside":true,"bump":{"position":-10,"size":10}}},"typespec":{"name":"Valence-2","level":6,"model":45,"code":645,"specs":{"shield":{"capacity":[270,270],"reload":[8.5,8.5]},"generator":{"capacity":[240,240],"reload":[60,60]},"ship":{"mass":200,"speed":[175,175],"rotation":[110,110],"acceleration":[120,120]}},"shape":[4.703,4.482,3.41,2.79,4.74,4.359,3.893,3.588,3.302,3.163,3.088,3.082,3.115,1.62,1.883,2.028,2.263,2.581,3.1,3.657,2.788,2.56,1.591,1.513,1.466,1.443,1.466,1.513,1.591,2.56,2.788,3.657,3.1,2.581,2.263,2.028,1.883,1.609,3.115,3.082,3.088,3.163,3.302,3.588,3.893,4.359,4.74,2.79,3.41,4.482],"lasers":[{"x":2.173,"y":-3.743,"z":-0.36,"angle":2.1,"damage":[15,15],"rate":4,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.173,"y":-3.743,"z":-0.36,"angle":-2.1,"damage":[15,15],"rate":4,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.387,"y":-0.359,"z":0.72,"angle":1.4,"damage":[15,15],"rate":4,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.387,"y":-0.359,"z":0.72,"angle":-1.4,"damage":[15,15],"rate":4,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.74}}'
        },
        name: "Divebomb",
        cooldown: 35 * 60,

        zoneDMGDelay: 3 * 60,
        zoneWarningTime: 1 * 60, // x seconds after ability cast

        zoneDMG: 500, // DMG to enemies inside the zone
        customEndcondition: true,

        range: 30,
        showAbilityRangeUI: true,
        includeRingOnModel: true,

        abilityDashSpeed: 1.5,

        objScale: 2.25,

        activeRings: new Map(),

        addActiveRing: function (ship) {
            this.activeRings.set(ship.id, {
                start: game.step,
                x: ship.x,
                y: ship.y,
                team: ship.team,
                id: ship.id,
                hue: HelperFunctions.toHSLA(TeamManager.getDataFromShip(ship).hue),
                ship
            });
        },

        deployWarningZone: function (ship) {
            HelperFunctions.setPlaneOBJ({
                id: "bomb_area_" + ship.id,
                position: { x: ship.x, y: ship.y },
                scale: {x: this.range * this.objScale, y: this.range * this.objScale },
                rotation: { x: 0, y: 0, z: Math.PI },
                type: {
                    id: "bomb_area_" + ship.team,
                    emissive: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/incident_zone.png",
                    emissiveColor: ship.hue
                }
            });
        },

        removeActiveRing: function (ship) {
            this.activeRings.delete(ship.id);

            HelperFunctions.removeObject("bomb_area_"+ship.id);
        },

        start: function (ship) {
            HelperFunctions.accelerate(ship, this.abilityDashSpeed);
            this.addActiveRing(ship);
            ship.custom.forceEnd = true;
        },

        end: function () {},

        globalTick: function (game) {
            for (let ring of this.activeRings.values()) {
                let duration = game.step - ring.start;
                if (!ring.warningDeployed && duration > this.zoneWarningTime) {
                    this.deployWarningZone(ring);
                    ring.warningDeployed = true;
                }
                if (duration > this.zoneDMGDelay) {
                    let victims = HelperFunctions.findEntitiesInRange(ring, this.range, false, true, { ships: true }, true);

                    for (let victim of victims) {
                        HelperFunctions.damage(victim, this.zoneDMG);
                        victim.set({ angle: Math.random() * 360 }); // simulate stun in a least effort way
                    }

                    this.removeActiveRing(ring.ship);
                }
            }
        },

        onCodeChanged: function (newTemplate) {
            if (newTemplate == null) {
                for (let ring of this.activeRings.values()) this.removeActiveRing(ring.ship);
                return;
            }
            newTemplate.activeRings = this.activeRings;
        },
    },
};





/* Imported from Commands.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

// only available when DEBUG is `true`
const MAKE_COMMANDS = function () {
    if (!DEBUG) return;
    const { echo, error } = game.modding.terminal;
    let gameCommands = game.modding.commands;

    if (!Array.isArray(game.custom.banList)) game.custom.banList = [];

    const locateShip = function(req, handler) {
        let args=req.replace(/^\s+/,"").replace(/\s+/," ").split(" "),id=Number(args[1]||"NaN");
        if (isNaN(id)) error("Please specify a ship id to take action");
        else {
            let ship=game.findShip(id);
            if (!ship) error("Requested ship not found!");
            else {
                try{typeof handler == "function" && handler(ship, id, args)}
                catch(e){ error("An error occured while taking action with the requested ship!")}
            }
        }
    }, infoName = function (ship) {
        return `${ship?.name || "ANONYMOUS"} (ID ${ship?.id || "Unknown"})`
    }

    let commands = [], addCommand = function (commandName, resolver, docs = {}) {
        commands.push(commandName);
        resolver.docs = { ...docs };
        gameCommands[commandName] = resolver;
    }, addShipCommand = function (commandName, resolver, doneText = '', docs = {}) {
        // doneText variables
        // %s ship info (name (ID id))
        // %r return value from resolver
        // dontText won't be shown if it's empty
        docs = { ...docs };
        if (!Array.isArray(docs.arguments)) docs.arguments = [];
        docs.arguments.unshift({ name: "id", required: true });
        addCommand(commandName, function (req) {
            locateShip(req, function (ship, id, args) {
                let data = resolver(ship, id, args);
                let info = infoName(ship);
                let text = doneText;
                if (text) text = text.replace(/%r/g, data).replace(/%s/g, info);
                if (text) echo(text);
            });
        }, docs);
    }, showCommandUsage = function (commandName, newline = false) {
        if (!commands.includes(commandName)) return echo(`Not found: '${commandName}'`);
        let command = gameCommands[commandName];
        if (command.docs == null) return echo(`${commandName}: No descriptions found.`);
        let docs = command.docs;
        let args = Array.isArray(docs.arguments) ? docs.arguments : [];
        echo(`${commandName} ${args.map(e => "<" + (e.required ? "" : "?") + e.name + ">").join(' ').trim()}${newline ? "\n": "\t"}[[;#0f60ff;]${docs.description || "No detailed description."}]`);
    }, showShipInfo = function (ship, newline = false) {
        let block = AbilityManager.isActionBlocked(ship);
        echo([
            `ID: ${ship.id}`,
            `Name: ${ship.name}`,
            showTeamInfo(ship),
            `X: ${ship.x}`,
            `Y: ${ship.y}`,
            `Ship: ${ship.custom.shipName}`,
            ship.custom.inAbility ? "In ability" : "",
            block.blocked ? (block.blocker.reason || "Blocked for no reasons") : "",
            ship.custom.abilitySystemDisabled ? "Ability Disabled" : ""
        ].filter(e => e).join(`.${newline ? "\n" : " "}`))
    }, showTeamInfo = function (ship) {
        let teamInfo = TeamManager.getDataFromShip(ship);
        return `Team: ${teamInfo.name.toUpperCase()}, Hue: ${teamInfo.hue}, ${teamInfo.ghost ? "Ghost team, " : ""}${teamInfo.spawnpoint ? ("Spawnpoint: X: " + teamInfo.spawnpoint.x + " Y: " + teamInfo.spawnpoint.y) : "No spawnpoint"}`;
    }, kick = function (ship, info, reason) {
        ship.custom.kicked = true;
        ship.custom.abilitySystemDisabled = true;
        ship.set({
            idle: true,
            collider: false,
            type: 101,
            vx: 0,
            vy: 0
        });
        let kickReason = ship.custom.kickReason || {};
        info = String(info || kickReason.info || "You've been kicked by map host!");
        reason = String(reason || kickReason.reason || "No reason has been provided");
        ship.custom.kickReason = { info, reason };
        ship.gameover({
            [info]: " ",
            "Reason": reason
        });
        try { UIData.updateScoreboard(game); } catch (e) {}
    }, ban = function (ship, info, reason) {
        kick(ship, info, reason);
        game.custom.banList.push({
            phrase: String(ship.name).toLowerCase(),
            full: true
        });
    }

    addCommand('commands', function () {
        for (let command of commands) showCommandUsage(command);
    }, {
        description: "Show all commands used by the mod"
    });

    addCommand('usage', function (req) {
        showCommandUsage(req.split(" ").slice(1).join(' '), true);
    }, {
        arguments: [ { name: "command_name", required: true }],
        description: "Show usage of a command"
    });

    addCommand('info', function (req) {
        let id = +req.split(" ").slice(1).join(" ").trim();
        let ship = game.findShip(id);
        if (ship == null || ship.id == null) {
            echo("List of ships and their specs:");
            for (let tship of game.ships) showShipInfo(tship);
        }
        else showShipInfo(ship, true);
    }, {
        arguments: [
            { name: "id", required: false }
        ],
        description: "Show all ship infos (specify id to only check that ship's info)"
    });

    addCommand('sunall', function () {
        for (let ship of game.ships) ship.set({x: 0, y: 0});
        echo('All players has been teleoprted to the sun!');
    }, { description: "Teleport all players to the sun" });

    addCommand('killaliens', function () {
        for (let alien of game.aliens) alien.set({ kill: true });
        echo('Killed all aliens!');
    }, { description: "Kill all aliens" });

    addCommand('map', function (req) {
        MapManager.set(req.split(" ").slice(1).join(" ").trim(), true);
        let info = MapManager.get();
        echo(`Changed map to ${info.name} by ${info.author}`);
    }, {
        arguments: [
            { name: "map_name", required: false }
        ],
        description: "Change map, leave map name blank for random"
    });

    addShipCommand('kick', function (ship, id, args) {
        kick(ship, "You've been kicked by the map host", args.slice(2).join(" "));
    }, '%s has been kicked', {
        arguments: [
            { name: "reason", required: false }
        ],
        description: "Kick a ship"
    }); 

    addShipCommand('ban', function (ship, id, args) {
        ban(ship, "You've been banned by the map host", args.slice(2).join(" "));
    }, '%s has been banned and nickname added to ban list', {
        arguments: [
            { name: "reason", required: false }
        ],
        description: "Ban a ship and add ship's nickname to ban list"
    });
    
    addCommand('banphrase', function (req) {
        let phrase = req.split(" ").slice(1).join(' ').toLowerCase();
        if (!phrase) return echo('Please include a phrase to ban');
        game.custom.banList.push({
            phrase,
            full: false
        });
        echo(`'${phrase}' added to ban list`);
    }, {
        arguments: [
            { name: "phrase", required: true }
        ],
        description: "Add a phrase to ban list"
    }); 

    addCommand('banlist', function () {
        echo("List of banned phrases/names:");
        let index = 0;
        for (let banInfo of game.custom.banList) {
            echo(`${index++}. ${banInfo.full ? "Name" : "Phrase"}: ${banInfo.phrase}`);
        }
    }, {
        description: "Show list of banned phrases/names"
    });

    addCommand('unban', function (req) {
        let id = +req.split(" ").slice(1).join(' '), info = game.custom.banList[id];
        if (info == null) return echo('No ban info with given ID found!');
        game.custom.banList.splice(id, 1);
        echo(`${info.full ? "Name" : "Phrase"}: ${info.phrase} has been unbanned.`);
    }, {
        arguments: [
            { name: "id", required: true }
        ],
        description: "Remove the ban for a phrase or name"
    });

    addShipCommand('restore', function (ship, id, args) {
        AbilityManager.restore(ship);
    }, '%s has been restored', {
        description: "Restore a ship's health and crystals"
    });

    addShipCommand('assign', function (ship, id, args) {
        let result = AbilityManager.assign(ship, args.slice(2).join(' ').trim());
        if (result.success) return `%s has been set to ${ship.custom.shipName}`
        return `Failed to set %s to another ship\nReason: ${result.reason || "No reason has been provided."}`;
    }, '%r', {
        arguments: [
            { name: "ship_name", required: false }
        ],
        description: "Set a ship to a specific ability ship, leave ship name blank for random assignment"
    });

    addShipCommand('forceassign', function (ship, id, args) {
        let result = AbilityManager.assign(ship, args.slice(2).join(' ').trim(), false, true);
        if (result.success) return `%s has been set to ${ship.custom.shipName}`
        return `Failed to set %s to another ship\nReason: ${result.reason || "No reason has been provided."}`;
    }, '%r', {
        arguments: [
            { name: "ship_name", required: false }
        ],
        description: "Force set a ship to a specific ability ship (bypassing checks)"
    });

    addShipCommand('reload', function (ship, id, args) {
        AbilityManager.reload(ship);
    }, 'Skipped cooldown for %s', {
        description: "Skip cooldown for a ship"
    });

    addShipCommand('kill', function (ship, id, args) {
        ship.set({ kill: true });
    }, '%s has been killed', {
        description: "Kills a ship"
    });

    addShipCommand('team', function (ship, id, args) {
        let team = args.slice(2).join(' ').trim();
        let teamInfo = TeamManager.getDataFromShip(ship);
        if (team) {
            let newTeam = TeamManager.getDataFromID(team);
            if (newTeam == teamInfo) return `%s is already on ${teamInfo.name.toUpperCase()}`;
            teamInfo = newTeam;
            TeamManager.set(ship, team, true, false);
            try { UIData.updateScoreboard(game); } catch (e) {}
        }
        return team ? `Set %s to team ${teamInfo.name.toUpperCase()}`: showTeamInfo(ship);
    }, '%r', {
        arguments: [
            { name: "team_id", required: false }
        ],
        description: "Get/Set ship's team info"
    });

    addShipCommand('ability', function (ship, id, args) {
        let abilityDisabled = ship.custom.abilitySystemDisabled = !ship.custom.abilitySystemDisabled;
        if (abilityDisabled) AbilityManager.end(ship);
        return abilityDisabled ? "Disabled" : "Enabled";
    }, '%r ability system for %s', {
        description: "Toggle ship's ability system (enable/disable)"
    });

    addShipCommand('tptoship', function (ship1, id1, args) {
        let id2 = +args.slice(2).join(' ');
        let ship2 = game.findShip(id2);
        if (ship2 == null || ship2.id == null) {
            error(`Failed: Ship with ID ${id2} doesn't exist`);
            return '';
        }
        ship1.set({ x: ship2.x, y: ship2.y });
        return `Teleported %s to ${infoName(ship2)}!`;
    }, '%r', {
        arguments: [
            { name: "id2", required: true }
        ],
        description: "Teleport from ship to ship2"
    });

    addShipCommand('tptoxy', function (ship, id, args) {
        let pos = {
            x: args[2],
            y: args[3]
        }
        if (pos.x == null || pos.x == "" || isNaN(pos.x)) delete pos.x; else pos.x = +pos.x;
        if (pos.y == null || pos.y == "" || isNaN(pos.y)) delete pos.y; else pos.y = +pos.y;
        if ('x' in pos || 'y' in pos) {
            ship.set(pos);
            return `Teleported %s to ${['x' in pos ? "X: " + pos.x : "", 'y' in pos ? "Y: " + pos.y : ""].join(' ').trim()}`;
        }
        return "Nothing to teleport to"
    }, `%r`, {
        arguments: [
            { name: "x", required: false },
            { name: "y", required: false }
        ],
        description: "Teleport ship to position x and/or y"
    });

    return {
        kick,
        ban
    }
}





/* Imported from Resources.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const RESOURCES = {
    planeOBJ: "https://starblast.data.neuronality.com/mods/objects/plane.obj"
}





/* Imported from HelperFunctions.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const HelperFunctions = {
    toHSLA: function (hue = 0, alpha = 1, saturation = 100, lightness = 50) {
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
    },
    getObjectID: function (id) {
        // return ability manager-specific id name (to prevent id duplication from other special IDs)
        return "__ABILITY_MANAGER_" + String(id) + "__"
    },
    setObject: function (specs) {
        specs = { ...specs };
        specs.id = this.getObjectID(specs.id);
        if (specs.type != null) specs.type.id = this.getObjectID(specs.type.id);
        game.setObject(specs);
    },
    removeObject: function (id) {
        // remove objects without leaving traces (client issues)
        this.setObject({
            id,
            position: { x:0, y: 0, z: Number.MAX_VALUE },
            rotation: { x:0, y: 0, z: 0 },
            scale: { x: Number.MIN_VALUE, y: Number.MIN_VALUE, z: Number.MIN_VALUE },
            type: {
                id,
            }
        });
        game.removeObject(this.getObjectID(id));
    },
    setPlaneOBJ: function (options) {
        options = options || {};
        this.setObject({
            ...options,
            position: {
                ...options.position,
                z: GAME_OPTIONS.plane_3D_OBJ_Z_level
            },
            scale: {
                ...options.scale,
                z: Number.MIN_VALUE
            },
            type: {
                ...(options.type || {}),
                obj: RESOURCES.planeOBJ
            }
        })
    },
    fromMapUnitToShipModelUnit: function (value, size) {
        // convert map unit to ship model unit
        return value * AbilityManager.model_conversion_ratio / size;
    },
    clone: function (obj) {
        // clone JSON-parseable object
        return JSON.parse(JSON.stringify(obj));
    },
    timeExceeded: function (timestamp, duration) {
        return game.step > (duration + timestamp);
    },
    timeLeft: function (timestamp) {
        return Math.max(Math.ceil((timestamp - game.step) / 60), 0);
    },
    randInt: function (num) {
        return Math.floor(Math.random() * num);
    },
    randIntInRange: function (start, end) {
        // random x with start <= x < end
        return this.randInt(end - start) + start;  
    },
    spawnCollectibles: function (ship, codes) {
        // spawn collectilble under ship
        for (let i of codes) game.addCollectible({
            x: ship.x,
            y: ship.y,
            code: i
        })
    },
    randomItem: function (list, removeItemAfterRandom = false) {
        if (list.length < 1) return { index: -1, value: null };
        let index = this.randInt(list.length);
        return {
            index,
            value: removeItemAfterRandom ? list.splice(index, 1)[0] : list[index]
        }
    },
    isTeam: function (ship1, ship2) {
        // check if ship2 is on the same team with ship1
        let team1 = TeamManager.getDataFromShip(ship1), team2 = TeamManager.getDataFromShip(ship2);
        
        // if ship1 on ghost team or there are no teams, only itself belongs to its team
        if (team1.ghost || GAME_OPTIONS.teams_count < 1) return ship1.id === ship2.id;

        // else
        return team1.id === team2.id;
    },
    simpleDistance: function (ship = {x: 0, y: 0}, target = {x: 0, y: 0}) {
        // @description simple distance function, just regular math
        return Math.sqrt((target.x - ship.x) ** 2 + (target.y - ship.y) ** 2);
    },
    distance: function(ship = {x: 0, y: 0}, target = {x: 0, y: 0}) {
        const mapsize_xy = game.options.map_size * 10;
        
        const x_diff = ship.x - target.x;
        const y_diff = ship.y - target.y;

        /* jshint ignore:start */
        const x_plus_mapsize = x_diff + mapsize_xy;
        const x_minus_mapsize = x_diff - mapsize_xy;

        const y_plus_mapsize = y_diff + mapsize_xy;
        const y_minus_mapsize = y_diff - mapsize_xy;
        /* jshint ignore:end */

        const d = [
            [x_diff, y_diff],
            [x_diff, y_plus_mapsize],
            [x_diff, y_minus_mapsize],
            [x_plus_mapsize, y_diff],
            [x_minus_mapsize, y_diff],
            [x_plus_mapsize, y_plus_mapsize],
            [x_plus_mapsize, y_minus_mapsize],
            [x_minus_mapsize, y_plus_mapsize],
            [x_minus_mapsize, y_minus_mapsize]
        ];

        let shortestPath, shortestAngle;
        for (let point of d) {
            let path = Math.sqrt(point[0] ** 2 + point[1] ** 2);
            let angle = Math.atan2(point[1], point[0]);

            if (shortestPath == null || shortestPath > path) {
                shortestPath = path;
                shortestAngle = angle;
            }
        }

        return {
            distance: shortestPath,
            angle: shortestAngle
        }
    },
    accelerate: function (ship, speed, angle = null, initial_dependency = 0) {
        // accelerate ship with speed and angle (or ship angle)
        if (angle == null) angle = ship.r;
        if (initial_dependency) speed += Math.sqrt(ship.vx ** 2 + ship.vy ** 2) * initial_dependency;
        ship.set({
            vx: speed * Math.cos(angle),
            vy: speed * Math.sin(angle)
        });
    },
    accelerateToTarget: function (ship, target, strength, push = false) {
        // accelerate ship from/to target with strength
        // push: `true` is push, otherwise pull
        let accelAngle = this.distance(target, ship).angle;
        if (push) accelAngle += Math.PI;
        this.accelerate(ship, strength, accelAngle);
    },
    satisfies: function (ship1, ship2, teammate, enemy) {
        // check if ship2 statisfies condition with ship1
        if (teammate && enemy) return true;
        if (teammate && this.isTeam(ship1, ship2)) return true;
        if (enemy && !this.isTeam(ship1, ship2)) return true;
        return false;
    },
    findEntitiesInRange: function (entity, range, teammate = false, enemy = false, includes = {
        aliens: false, // include aliens
        ships: false, // include asteroids
        asteroids: false, // include ships
        self: false // include itself (see notes below)
    }, dontSort = false) {
        // Find all entities in range
        // Set `donSort` to `true` if you want it to ignore the sorting
        // Set `includeSelf` to `true` if you want to include the entity (if condition matches)
        // Note that please pass `entity` as a ship, asteroid or alien object if neccessary (in case for `includeSelf` to match)
        // or else, just pass this object to `entity`:
        // {
        //     x: Number,
        //     y: Number,
        //     team: any // it will try to find any ships with the same/different team as the defined team ID (if condition matches)
        // }

        includes = includes || {};

        let data = [];

        if (entity == null || !["aliens", "asteroids", "ships", "self"].find(a => includes[a])) return data;

        if (includes.aliens) {
            let isAlien = game.aliens.includes(entity);
            // Only find aliens if:
            // - Given entity is an alien --> teammate =?= true
            // - Given entity is not an alien --> enemy =?= true
            if (isAlien ? teammate : enemy) data.push(...game.aliens.filter(alien => alien != null && alien.id != -1 && (includes.self || !isAlien || alien !== entity) && this.distance(entity, alien).distance <= range))
        }
        
        if (includes.asteroids) {
            let isAsteroid = game.asteroids.includes(entity);
            // Only find asteroids if:
            // - Given entity is an asteroid --> at least `teammate` or `enemy` is `true` (since we don't know if asteroids are friends or foes to each other?)
            // - Given entity is not an asteroid --> enemy =?= true
            if (isAsteroid ? (teammate || enemy) : enemy) data.push(...game.asteroids.filter(asteroid => asteroid != null && asteroid.id != -1 && (includes.self || !isAsteroid || asteroid !== entity) && this.distance(entity, asteroid).distance <= range));
        }

        // Only find ships if either `teammate` or `enemy` is `true`

        if (includes.ships && (teammate || enemy)) data.push(...game.ships.filter(ship => (ship || {}).id != null && ship.alive && (includes.self || ship !== entity) && this.satisfies(entity, ship, teammate, enemy) && this.distance(entity, ship).distance <= range));
        
        if (dontSort) return data;

        return data.sort((a, b) => this.distance(entity, a).distance - this.distance(entity, b).distance);
    },
    damage: function (ship,num) {
        // damage ship by `num` HP
        if (ship.shield < num){
            let val = ship.crystals + ship.shield;
            if (val < num) ship.set({kill:true});
            else ship.set({crystals: val - num, shield: 0});
        }
        else ship.set({shield:ship.shield-num});
    },
    parseUI: function (UI) {
        try { UI = new Object(JSON.parse(JSON.stringify(UI))) } catch (e) { UI = {} }
      
        let id;
        try { id = String(UI.id) } catch (e) { id = '' }
      
        let parsedUI = {
          id: id,
          position: UI.position,
          visible: UI.visible,
          clickable: UI.clickable,
          shortcut: UI.shortcut,
          components: UI.components
        }
      
        if (parsedUI.visible || parsedUI.visible == null) {
          delete parsedUI.visible;
          let position = parsedUI.position, count = 0;
          for (let i = 0 ; i < 4 ; i++) {
            let pos = (position||{})[i];
            if (pos == null || pos == 100) count++
          }
          if (count == 4) delete parsedUI.position
        }
        else {
          parsedUI.position = [0,0,0,0];
          parsedUI.visible = false;
          delete parsedUI.components
        }
      
        if (!parsedUI.clickable) {
          delete parsedUI.clickable;
          delete parsedUI.shortcut
        }
      
        return parsedUI
    },
    sendUI: function (ship, UI) {
        if (ship != null && "function" == typeof ship.setUIComponent) ship.setUIComponent(this.parseUI(UI));
    },
    TimeManager: {
        id_pool: 0,
        setTimeout: function(f,time){
            let id = this.id_pool++;
            this.jobs.set(id, {f: f,time: game.step+time});
            return id;
        },
        clearTimeout: function (id) {
            this.jobs.delete(id);
        },
        jobs: new Map(),
        tick: function() {
          var t = game.step;
          for (let i of this.jobs){
            var job = i[1];
            if (t>=job.time){
              try {
                job.f();
              }
              catch (err){
                console.error(err);
              }
              this.jobs.delete(i[0]);
            }
          }
        }
    },
    fill: function (text, limit) {
        // fill text with whitespaces until limit
        let charLeft = limit - text.length;
        if (charLeft <= 0) return text;
        return " ".repeat(Math.floor(charLeft / 2)) + text + " ".repeat(Math.ceil(charLeft / 2));
    },
    templates: {
        canStart: function (ship) {
            return !ship.custom.inAbility && HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.cooldown);
        },

        canEnd: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.duration);
        },

        start: function (ship) {
            ship.set({invulnerable: 100, type: this.codes.ability, stats: AbilityManager.maxStats, generator: 0});
        },

        end: function (ship) {
            if (ship.custom.ability === this) ship.set({invulnerable: 100, type: this.codes.default, stats: AbilityManager.maxStats, generator: this.generatorInit});
        },

        tick: function () {},

        initialize: function () {},

        event: function (event, ship) {
            if (event.name == "ship_destroyed" && event.ship == ship && this.endOnDeath && ship.custom.inAbility) AbilityManager.end(ship);
        },

        requirementsText: function (ship) {
            return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.cooldown);
        },

        abilityName: function (ship) {
            return this.name;
        },

        reload: function (ship) {
            ship.custom.lastTriggered = game.step - this.cooldown;
        },

        unload: function (ship) {
            ship.custom.lastTriggered = game.step;
        },

        onCodeChanged: function () {},

        getDefaultShipCode: function (ship) {
            return this.codes.default
        }
    },
    terminal: {
        errors: 0,
        log: function (text) {
            AbilityManager.echo(`[[bg;azure;][AbilityCompiler\\] ${text}]\n`);
        },
        error: function (text) {
            ++this.errors;
            AbilityManager.echo(`[[bg;#FF7733;][AbilityCompiler\\] ${text}]\n`);
        }
    }
}





/* Imported from Managers.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const TeamManager = {
    ghostTeam: GhostTeam,
    staticList: StaticTeams.map(v => {
        let x = Teams[v];
        Teams[v] = null;
        return x;
    }),
    teams_list: Teams.filter(t => t),
    initialize: function () {
        this.teams = game.custom.teams;
        if (this.teams == null) {
            this.teams = game.custom.teams = new Array(GAME_OPTIONS.teams_count);
            let teams = [...Array(GAME_OPTIONS.teams_count)].map((v, i)=> i);
            while (teams.length > 0) {
                let i = HelperFunctions.randomItem(teams, true).value;
                let chosenTeam;
                if (this.staticList.length > 0) chosenTeam = HelperFunctions.randomItem(this.staticList, true).value;
                else chosenTeam = HelperFunctions.randomItem(this.teams_list, true).value;
                let { index } = HelperFunctions.randomItem(chosenTeam.names);
                this.teams[i] = {
                    ...chosenTeam,
                    name: chosenTeam.names[index],
                    hue: chosenTeam.hues[index],
                    id: i
                };
            }
        };
    },
    getAll: function () {
        if (!Array.isArray(this.teams)) this.initialize();
        return this.teams;
    },
    getDataFromID: function (team) {
        return this.getAll()[team] || this.ghostTeam;
    },
    getDataFromShip: function (ship) {
        return this.getDataFromID((ship.custom == null || ship.custom.team == null) ? ship.team : ship.custom.team);
    },
    setGhostTeam: function (ship, changeTeam = false, TpBackToBase = false) {
        this.set(ship, 69, changeTeam, TpBackToBase)
    },
    set: function (ship, team = ship.team, changeTeam = false, TpBackToBase = false) {
        let teamData = this.getDataFromID(team);
        ship.set({hue: teamData.hue});
        if (changeTeam) {
            ship.set({team: teamData.id});
            ship.custom.team = teamData.id;
            AbilityManager.updateShipsList(teamData);
        }
        if (TpBackToBase) MapManager.spawn(ship);
    }
}

const MapManager = {
    maps: (function() {
        let spawnpoints_count = TeamManager.getAll().filter(t => t.need_spawnpoint).length + !!TeamManager.ghostTeam.need_spawnpoint;
        return Maps.filter(e => e.spawnpoints.length >= spawnpoints_count)
    })(),
    search: function (nameOrIndex) {
        if (nameOrIndex == null) return null;
        return this.maps[nameOrIndex] || this.maps.find(m => m.name.toLowerCase() == String(nameOrIndex).toLowerCase());
    },
    get: function (set = false, forceReset = false) {
        if (this.map == null || forceReset) {
            this.map = this.search(GAME_OPTIONS.map_preset_name);
            if (this.map == null) this.map = HelperFunctions.randomItem(this.maps).value;
        }
        if (this.map == null) {
            HelperFunctions.terminal.error(`Can't find any maps for ${GAME_OPTIONS.teams_count} team(s)? Are you sure?`);
            this.map = { name: "Unknown", author: "Unknown", map: "", spawnpoints: []}
        }
        if (set) {
            try { game.setCustomMap(this.map.map); } catch (e) {}
            this.assignSpawnpoints();
        }
        return this.map;
    },
    sortPairings: function (pairs, dist) {
        return pairs.sort((p1, p2) => {
            if (p1.length == p2.length) return HelperFunctions.randInt(2) || -1;
            let absoluteDistance = Math.abs(dist - p1.length) - Math.abs(dist - p2.length);

            if (absoluteDistance == 0) return p2.length - p1.length;

            return absoluteDistance;
        }); // no invalid pairs
    },
    assignSpawnpoints: function () {
        let teams = [...TeamManager.getAll(), TeamManager.ghostTeam], { spawnpoints, pairings } = this.get();

        if (!Array.isArray(spawnpoints) || spawnpoints.length < 1) return;

        let pairs = pairings;

        if (Array.isArray(pairs)) pairs = this.sortPairings(HelperFunctions.clone(pairs).filter(e => Array.isArray(e) && e.length > 0), GAME_OPTIONS.teams_count);
        else pairs = [];

        if (pairs.length < 1) pairs = [ // placeholder
            new Array(spawnpoints.length).fill(0).map((e, i) => i)
        ];

        let curPair = pairs.shift(), dist = GAME_OPTIONS.teams_count;

        for (let team of teams) if (team && team.need_spawnpoint) {
            if (curPair.length < 1) { // current candidate has no spawnpoints
                if (pairs.length < 1) break; // no more pairs
                curPair = this.sortPairings(pairs, dist).shift();
            }

            --dist;

            let val = HelperFunctions.randomItem(curPair, true).value;

            let i = 0;

            while (i < pairs.length) { // delete all pairs with duplicate index
                if (pairs[i].indexOf(val) < 0) ++i;
                else pairs.splice(i, 1);
            }
            
            team.spawnpoint = spawnpoints[val];
        }
    },
    spawn: function (ship) {
        let { spawnpoint } = TeamManager.getDataFromShip(ship);
        if (spawnpoint != null) {
            let distance = Math.random() * BASES.size, angle = Math.random() * 2 * Math.PI;
            ship.set({
                x: spawnpoint.x + distance * Math.cos(angle) ,
                y: spawnpoint.y + distance * Math.sin(angle)
            });
        }
    },
    set: function (nameOrIndex, set = false) {
        this.map = this.search(nameOrIndex);
        return this.get(set);
    }
}

const AbilityManager = {
    includeRingOnModel: GAME_OPTIONS.ability.include_rings_on_model,
    showAbilityNotice: GAME_OPTIONS.ability.notice.show,
    abilityNoticeTimeout: GAME_OPTIONS.ability.notice.timeout,
    abilityNoticeMessage: GAME_OPTIONS.ability.notice.message,
    abilityShortcut: GAME_OPTIONS.ability.shortcut,
    shipLevels: GAME_OPTIONS.ability.ship_levels,
    model_conversion_ratio: 50, // don't change
    maxStats: GAME_OPTIONS.ability.max_stats,
    crystals: GAME_OPTIONS.ability.crystals,
    usageLimit: GAME_OPTIONS.ability.usage_limit,
    updateDelay: 5, // technical spec, don't touch if you don't know what it does
    UIActionsDelay: 0.2 * 60,
    _this: this,
    echo: DEBUG ? (window || global).echo || game.modding.terminal.echo : function () {},
    ring_model: {
        section_segments: 64,
        offset: {x: 0, y: 0, z: 0},
        position: {
            x: [0,0,0,0,0,0,0,0],
            y: [0,0],
            z: [0,0,0,0,0,0,0,0,0]
        },
        texture: [ 17 ],
        vertical: true
    },
    UI: {
        id: "ability",
        position: [46.4, 86, 7.2, 8],
        colors: {
            ready: {
                stroke: "#00FF00",
                fill: "#002200",
                text: "#88FF88"
            },
            notReady: {
                stroke: "#FF0000",
                fill: "#220000",
                text: "#FFAAAA"
            }
        }
    },
    requestEntitiesInfoUpdate: function () {
        // request entities info updates so they could be available on the next ticks
        if (!game.custom.abilityCustom.entitiesUpdateRequested) {
            let entities = [...game.ships, ...game.aliens, ...game.asteroids];
            for (let entity of entities) {
                if (entity != null && entity.id != null && entity.id != -1) entity.set({});
            }
            game.custom.abilityCustom.entitiesUpdateRequested = true;
        }
    },
    tick: function (ship) {
        this.updateUI(ship);
        let ability = ship.custom.ability;
        if (!ship.custom.inAbility || ability == null) return;
        let timePassed = game.step - ship.custom.lastTriggered
        if (timePassed % ability.tickInterval === 0) ability.tick(ship, timePassed);
        if (ability.customEndcondition && (ship.custom.forceEnd || ability.canEnd(ship))) this.end(ship);
    },
    end: function (ship) {
        let ability = ship.custom.ability;
        if (ability == null) return;
        ship.custom.inAbility = false;
        ship.custom.forceEnd = false;
        HelperFunctions.TimeManager.clearTimeout(ability.ships.get(ship.id));
        ability.ships.delete(ship.id);
        if (ability.cooldownRestartOnEnd) ability.unload(ship);
        ability.end(ship);
        if ("function" == typeof this.onAbilityEnd) this.onAbilityEnd(ship);
    },
    canStart: function (ship) {
        return game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled && ship.alive && !this.isAbilityBlocked(ship).blocked && ship.custom.ability.canStart(ship);
    },
    start: function (ship) {
        let ability = ship.custom.ability;
        if (ability == null || !ability.canStart(ship) || (!ability.canStartOnAbility && ship.custom.inAbility) || !ship.alive) return;

        ship.custom.lastTriggered = game.step;
        ship.custom.forceEnd = false;
        let lastStatus = ship.custom.inAbility;
        ship.custom.inAbility = true;
        ability.start(ship, lastStatus);
        if (ability.duration != null) {
            let oldTimeout = ability.ships.get(ship.id);
            if (oldTimeout != null) HelperFunctions.TimeManager.clearTimeout(oldTimeout);
            ability.ships.set(ship.id, HelperFunctions.TimeManager.setTimeout(function () {
                this.end(ship);
            }.bind(this), ability.duration));
        }

        if ("function" == typeof this.onAbilityStart) this.onAbilityStart(ship, lastStatus);
    },
    requirementsInfo: function (ship) {
        if (!game.custom.abilitySystemEnabled || ship == null || ship.custom.abilitySystemDisabled || !ship.alive) return { ready: false, text: "Disabled" }
        let ability = ship.custom.ability;
        let isActionBlocked = this.isAbilityBlocked(ship);
        if (isActionBlocked.blocked) return { ready: false, text: isActionBlocked.blocker.abilityDisabledText || "Disabled" };
        if (ability == null) return { ready: false, text: "Disabled" };
        let ready = this.canStart(ship);
        if (ready) return {
            ready: true,
            text: ability.useRequirementsTextWhenReady ? ability.requirementsText(ship) : "Ready"
        };
        return {
            ready: false,
            text: ship.custom.inAbility && ability.cooldownRestartOnEnd && !ability.customInAbilityText ? "In Ability" : ability.requirementsText(ship)
        }
    },
    updateUI: function (ship) {
        let lastUI = ship.custom.lastUI || {}, ability = ship.custom.ability;
        let abilityName = ability.abilityName(ship), { ready, text } = this.requirementsInfo(ship);
        if (lastUI.ready !== ready || lastUI.text !== text || lastUI.abilityName !== abilityName) {
            lastUI = ship.custom.lastUI = { ready, text, abilityName };
            let color = this.UI.colors[ready ? "ready" : "notReady"];
            HelperFunctions.sendUI(ship, {
                id: this.UI.id,
                position: this.UI.position,
                clickable: lastUI.ready,
                visible: true,
                shortcut: this.abilityShortcut,
                components: [
                    { type: "text",position:[0,0,100,50],value: HelperFunctions.fill(abilityName + ` [${this.abilityShortcut}]`, 15), color: "#FFFFFF"},
                    { type: "box",position:[0,50,100,50],fill: color.fill, stroke: color.stroke,width:4},
                    { type: "text",position:[2.5,57.5,95,35],value: text ,color: color.text},
                ]
            })
        }
    },
    event: function (event, ship) {
        return ship.custom.ability && ship.custom.ability.event(event, ship);
    },
    reload: function (ship) {
        return ship.custom.ability && ship.custom.ability.reload(ship);
    },
    isActionBlocked: function (ship) {
        // check if there are any ship effects blocking this ship from taking actions
        for (let actionBlocker of this.shipActionBlockers) {
            let { ability, shipChange } = actionBlocker;
            if ("function" == typeof ability.checker && ability.checker(ship))  return {
                blocked: true,
                blocker: ability
            }

            if ("function" == typeof shipChange.checker && shipChange.checker(ship))  return {
                blocked: true,
                blocker: shipChange
            }
        }

        return { blocked: false }
    },
    isAbilityBlocked: function (ship) {
        // check if there are any ship effects blocking this ship from starting abilities
        for (let actionBlocker of this.shipActionBlockers) {
            let { ability } = actionBlocker;
            if ("function" == typeof ability.checker && ability.checker(ship))  return {
                blocked: true,
                blocker: ability
            }
        }

        return { blocked: false }
    },
    clearAllActionBlockers: function (ship) {
        for (let actionBlocker of this.shipActionBlockers) {
            let { ability, shipChange } = actionBlocker;
            if ("function" == typeof ability.clear) ability.clear(ship);
            if ("function" == typeof shipChange.clear) shipChange.clear(ship);
        }
    },
    limitExceeded: function (shipName, ship) {
        return this.abilities[shipName] != null && shipName != ship.custom.shipName && !this.getAssignableShipsList(ship).includes(shipName);
    },
    assignStatus: {
        limitExceeded: {
            code: "SHIP_LIMIT_EXCEEDED",
            message: "Ship limit exceeded"
        },
        actionBlocked: {
            code: "SHIP_ACTION_BLOCKED"
        },
        inAbility: {
            code: "IN_ABILITY",
            reason: "Ship is still in ability"
        },
        success: {
            code: "SUCCESS"
        },
        sixtyNine: {
            code: "69",
            reason: "Nice"
        }
    },
    assign: function (ship, abilityShip, dontAssign = false, bypass = {
        // object used to bypass checks (set to `true` to take effect)
        ability: false, // bypass ability checks
        blocker: false, // bypass action blocker checks
        limit: false // bypass ship limit checks
        // additionally, you can set `bypass` to `true` to basically bypass everything
        // (basically a forced set)
    }, ignoreReset = {
        // ignore reset options
        blocker: false // ignore clearing blockers when set, this might be the only option available
    }) {
        bypass = bypass || {};
        let forced = bypass === true;
        if (!forced) {
            if (!bypass.ability && ship.custom.inAbility) return { success: false, ...this.assignStatus.inAbility }
            let isActionBlocked = bypass.blocker ? { blocked: false } : this.isActionBlocked(ship);
            if (isActionBlocked.blocked) return {
                success: false,
                ...this.assignStatus.actionBlocked,
                reason: isActionBlocked.blocker.reason || "No reason was provided"
            }
        }
        let shipAbil = this.abilities[abilityShip];
        if (shipAbil == null) {
            let requestedName = String(abilityShip).toLowerCase().replace(/[^a-z0-9]/gi, "");
            let foundName = this.ships_list.find(name => name.toLowerCase().replace(/[^a-z0-9]/gi, "") == requestedName);
            if (foundName != null) shipAbil = this.abilities[abilityShip = foundName];
        }
        if (!forced && !bypass.limit && this.limitExceeded(abilityShip, ship)) return { success: false, ...this.assignStatus.limitExceeded }
        if (dontAssign) return { success: true, ...this.assignStatus.success }
        if (shipAbil == null) return this.random(ship, forced);
        if (ship.custom.inAbility) this.end(ship);
        ignoreReset = ignoreReset || {};
        let ignoreAll = ignoreReset === true;
        if (!ignoreAll && !ignoreReset.blocker) {
            this.clearAllActionBlockers(ship);
            ship.set({
                healing: false,
                collider: true,
                idle: false
            });
        }
        ship.custom.shipName = abilityShip;
        ship.custom.ability = shipAbil;
        ship.custom.inAbility = false;
        ship.custom.forceEnd = false;
        ship.custom.abilityCustom = {};
        ship.custom.lastUI = {};
        ship.set({
            type: shipAbil.codes.default,
            generator: shipAbil.generatorInit,
            stats: AbilityManager.maxStats
        });
        shipAbil.initialize(ship);
        shipAbil.unload(ship);
        this.updateShipsList(TeamManager.getDataFromShip(ship));
        return { success: true };
    },
    restore: function (ship) {
        let abil = ship.custom.ability || {};
        if (ship != null) ship.set({
            shield: 1e4,
            crystals: abil.crystals || 0
        });
    },
    globalTick: function (game) {
        if (DEBUG && game.step == 0 && HelperFunctions.terminal.errors > 0) {
            HelperFunctions.terminal.error(`Stopping mod due to ${HelperFunctions.terminal.errors} error(s).`);
            game.modding.commands.stop();
            this.globalTick = function () {};
        }
        else this.globalTick = this.globalTick2;
        this.globalTick(game);
    },
    abilityRangeUI: {
        width: 2,
        id: "abilityRange",
        optionUI: {
            prefix: "preset_change_",
            infoID: "preset_info",
            data: {
                position: [65, 0, 15, 5],
                components: [
                    { type: "text", position: [0, 0, 100, 50], value: "RATIO GO HERE", color: "#cde", align: "right"},
                    { type: "text", position: [0, 50, 100, 50], value: "[0] - [9] to change", color: "#cde", align: "right"}
                ]
            }
        },
        renderInfo: function (ship) {
            let UI = {
                id: this.optionUI.presetInfo,
                ...this.optionUI.data
            }, preset = this.getPreset(ship);

            UI.components[0].value = `Aspect Ratio ${preset.w}:${preset.h} [${(ship.custom.preferredRatioPreset + 1) % 10}]`;

            HelperFunctions.sendUI(ship, UI);
        },
        handleOptions: function (ship, id) {
            if (!id.startsWith(this.optionUI.prefix)) return;
            let oldPresetIndex = ship.custom.preferredRatioPreset;
            let option = id.replace(this.optionUI.prefix, "");
            ship.custom.preferredRatioPreset = option == "next" ? ++ship.custom.preferredRatioPreset : +option;
            this.getPreset(ship);
            if (ship.custom.preferredRatioPreset === oldPresetIndex) return;
            this.renderInfo(ship);
            this.set(ship);
        },
        showOptions: function (ship) {
            if ((ship || {}).id == null) return;
            for (let i = 0; i < 10; ++i) { // yes this part is hardcoded
                HelperFunctions.sendUI(ship, {
                    id: this.optionUI.prefix + i,
                    visible: false,
                    clickable: true,
                    shortcut: ((i + 1) % 10).toString() // 1 2 3 4 5 6 7 8 9 0
                });
            }

            HelperFunctions.sendUI(ship, {
                id: this.optionUI.prefix + "next",
                clickable: true,
                position: [75, 5, 5, 2.5],
                components: [
                    { type: "box", position: [0, 0, 100, 100], stroke: "#cde", width: 2},
                    { type: "text", position: [0, 0, 100, 100], value: "Change", color: "#cde"}
                ]
            })
        },
        color: "#cde",
        vertical_scale: 1.425, // we will scale using vertical ratio as base
        presets: [
            // most popular ratio
            {w: 16, h: 9},
            // pc/laptop ratios
            {w: 16, h: 10}, // hello mac users :)
            {w: 4, h: 3},
            // phone ratios
            {w: 18, h: 9},
            {w: 19.5, h: 9},
            {w: 21, h: 9},
            // others
            {w: 1, h: 1} // S Q U A R E
        ],
        getPreset: function (ship) {
            let x = ship.custom.preferredRatioPreset;
            let preset = this.presets[x] || this.presets[x = 0];
            ship.custom.preferredRatioPreset = x;
            return preset;
        },
        threeJSClientSpecs: {
            // most of this are from Starblast client anyway
            // might subject to change in the future if the client updates
            cameraZ: 70, // 140 in welcome screen, but it's useless because who plays arena mod on welcome screen...?
            defaultAngle: Math.PI / 4,
            getZoom: function (zoom, radius) { return Math.pow(radius / 3, 0.3) / zoom },
            angle: function (zoom, radius) { return this.getZoom(zoom, radius) * this.defaultAngle },
            calculatePlaneScale: function (zoom, radius) {
                // https://stackoverflow.com/a/15331885
                return 2 * Math.tan(this.angle(zoom, radius) / 2);
            },
            getVisibleHeightFraction: function (range, shipRadius, zoom, scale) {
                return scale * (range * 2) / this.calculatePlaneScale(zoom, shipRadius);
            }
        },
        set: function (ship) {
            if ((ship || {}).id == null) return;
            
            let shipAbil = ship.custom.ability;

            if (!(shipAbil || {}).showAbilityRangeUI || shipAbil.range == null) return HelperFunctions.sendUI(ship, { id: this.id, visible: false});

            let preset = this.getPreset(ship);

            let zoomLevel = AbilityManager.zoomLevel[ship.custom.__last_ability_ship_type__ || ship.type] || {};

            // render abilityRange UI here
            let height = this.threeJSClientSpecs.getVisibleHeightFraction(shipAbil.range, zoomLevel.radius || 1, zoomLevel.zoom || 1, this.vertical_scale);
            let width = height * preset.h / preset.w;

            HelperFunctions.sendUI(ship, {
                id: this.id,
                position: [(100 - width) / 2, (100 - height) / 2, width, height],
                components: [
                    { type: "round", position: [0, 0, 100, 100], stroke: this.color, width: this.width }
                ]
            });
        }
    },
    globalTick2: function (game) {
        game.custom.abilityCustom.entitiesUpdateRequested = false;
        HelperFunctions.TimeManager.tick();
        for (let ability of Object.values(this.abilities)) {
            if ("function" == typeof ability.globalTick) ability.globalTick(game);
        }
        let oldList = game.custom.__ability_manager_players_list__;
        if (!Array.isArray(oldList)) oldList = [];
        let newList = [];

        for (let ship of game.ships) {
            if (ship.id == null) continue;
            if (!ship.custom.__ability__initialized__ && ship.alive) {
                this.random(ship, true);
                this.abilityRangeUI.showOptions(ship);
                this.abilityRangeUI.renderInfo(ship);
                ship.custom.__ability__initialized__ = true;
            }
            if (this.showAbilityNotice && ship.custom.allowInstructor) {
                if (this.abilityNoticeMessage) {
                    ship.instructorSays(String(this.abilityNoticeMessage.call(GAME_OPTIONS, ship)), TeamManager.getDataFromShip(ship).instructor);
                    if (this.abilityNoticeTimeout > 0) HelperFunctions.TimeManager.setTimeout(function () {
                        ship.hideInstructor();
                    }, this.abilityNoticeTimeout);
                }
                ship.custom.allowInstructor = false;
            }
            if (ship.custom.__ability__initialized__) {
                if (ship.type != ship.custom.__last_ability_ship_type__) {
                    ship.custom.__last_ability_ship_type__ = ship.type;
                    this.abilityRangeUI.set(ship);
                }
                if (game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled) {
                    newList.push({ id: ship.id, team: TeamManager.getDataFromShip(ship) });
                    let oldIndex = oldList.findIndex(s => s.id === ship.id);
                    if (oldIndex >= 0) oldList.splice(oldIndex, 1);
                }
                this.tick(ship);
            }
            let lastStatus = !!ship.custom.lastActionBlockerStatus;
            let currentStatus = AbilityManager.isActionBlocked(ship).blocked;
            if ("function" == typeof this.onActionBlockStateChange && lastStatus != currentStatus) this.onActionBlockStateChange(ship);
            ship.custom.lastActionBlockerStatus = currentStatus;
        }

        if (oldList.length > 0) {
            let teams = [...new Set(oldList.map(e => e.team))];
            for (let team of teams) this.updateShipsList(team);
        }

        game.custom.__ability_manager_players_list__ = newList;
    },
    globalEvent: function (event, game) {
        let ship = event.ship;
        if (ship == null || ship.id == null || !ship.custom.__ability__initialized__ || ship.custom.ability == null) return;
        switch (event.name) {
            case "ui_component_clicked":
                let component = event.id;
                switch (component) {
                    case this.UI.id:
                        this.start(ship);
                        break;
                    default:
                        if (ship.custom.__abilitySystem_last_ui_action__ != null && game.step - ship.custom.__abilitySystem_last_ui_action__ <= this.UIActionsDelay) break;
                        ship.custom.__abilitySystem_last_ui_action__ = game.step;
                        this.abilityRangeUI.handleOptions(ship, component);
                }
                break;
            case "ship_spawned":
                ship.set({crystals: ship.custom.ability.crystals});
                if (!ship.custom.inAbility || ship.custom.ability.endOnDeath) ship.custom.ability.unload(ship);
                break;
        }
        AbilityManager.event(event, ship);
        if (event.killer != null) AbilityManager.event(event, event.killer);
        for (let ability of Object.values(AbilityManager.abilities)) {
            if ("function" == typeof ability.globalEvent) ability.globalEvent(event);
        }
    },
    initialize: function () {
        this.compileAbilities();
        
        // for debug issues
        let oldAbilityManager = game.custom.AbilityManager;
        if (oldAbilityManager != null) {
            // preserve ability templates so it won't break
            for (let abil in oldAbilityManager.abilities) {
                let ability = oldAbilityManager.abilities[abil], newAbility = AbilityManager.abilities[abil];
                if (newAbility != null) newAbility.ships = ability.ships;
                ability.onCodeChanged(newAbility);
            }

            // reset abilities on ships
            for (let ship of game.ships) {
                if (ship.custom.abilityCustom == null) ship.custom.abilityCustom = {};
                oldAbilityManager.end(ship);
                let ability = AbilityManager.abilities[ship.custom.shipName];
                if (ability != null) ship.custom.ability = ability;
                else AbilityManager.random(ship, true);
            }
        }

        game.custom.AbilityManager = AbilityManager;

        if (game.custom.abilityCustom == null) game.custom.abilityCustom = {};

        if (DEBUG) {
            let gb = window || global;

            gb.AbilityManager = AbilityManager;
            gb.TeamManager = TeamManager;
            gb.MapManager = MapManager;

            game.custom.abilitySystemCommands = MAKE_COMMANDS();

            let systemInfo = __ABILITY_SYSTEM_INFO__;

            let resourceLink = `https://github.com/Bhpsngum/Arena-mod-remake/blob/main/releases/${systemInfo.name}_v${systemInfo.version}_${systemInfo.branch}.js`;

            fetch(resourceLink + '?raw=true').then(data => data.text().then(text => {
                let latestBuildID = (text.match(/buildID:\s*"([a-f0-9]+)"/) || [])[1];
                if (latestBuildID != systemInfo.buildID) $("#terminal").terminal().echo(`\n\nNOTICE: Newer build ([[;#AAFF00;]${latestBuildID}]) detected!\nYou can get it through `, {
                    finalize: function (div) {
                        div.children().last().append(`<a href="${resourceLink}" target="_blank">this link.</a><br><br>`)
                    }
                })
            })).catch(e => {
                game.modding.terminal.error("Failed to fetch source version info");
            });
        }
    },
    compileAbilities: function () {
        // Compile ships and abilities
        
        this.ship_codes = [];
        this.shipActionBlockers = [];
        this.zoomLevel = {};

        let smallestLimit = Math.ceil(GAME_OPTIONS.max_players / GAME_OPTIONS.teams_count / Object.values(this.abilities).filter(e => !e.hidden).length);

        this.usageLimit = Math.max(this.usageLimit, smallestLimit) || Infinity;

        let model = 100, templates = HelperFunctions.templates;

        for (let shipName in this.abilities) {
            let ability = this.abilities[shipName];
            // delete hidden ones
            if (ability.hidden != null && ability.hidden) {
                delete this.abilities[shipName];
                HelperFunctions.terminal.log(`Ignoring '${shipName}' because it's hidden`);
                continue;
            }
            // functions and properties polyfill

            ability.shipName = shipName;

            let actionBlocker = {};
            if (ability.actionBlocker != null) actionBlocker.shipChange = actionBlocker.ability = ability.actionBlocker;
            else {
                actionBlocker.shipChange = ability.shipChangeBlocker;
                actionBlocker.ability = ability.abilityBlocker;
            }

            if (actionBlocker.shipChange != null || actionBlocker.ability != null) {
                actionBlocker.shipChange = actionBlocker.shipChange || {};
                actionBlocker.ability = actionBlocker.ability || {};
                this.shipActionBlockers.push(actionBlocker);
            }

            ability.ships = new Map();

            ability.tickInterval = Math.floor(Math.max(ability.tickInterval, 1)) || 1;

            ability.crystals = Math.max(0, ability.crystals);

            if (isNaN(ability.crystals)) ability.crystals = this.crystals;

            ability.usageLimit = Math.max(ability.usageLimit, smallestLimit) || this.usageLimit;

            if ("function" != typeof ability.canStart) ability.canStart = templates.canStart;

            if ("function" != typeof ability.canEnd) ability.canEnd = templates.canEnd;

            let needAbilityShip = false;
            if ("function" != typeof ability.start) {
                ability.start = templates.start;
                needAbilityShip = true;
            }

            // don't ask why

            if ("function" != typeof ability.end) ability.end = templates.end;

            if ("function" != typeof ability.tick) ability.tick = templates.tick;

            if ("function" != typeof ability.event) ability.event = templates.event;

            if ("function" != typeof ability.requirementsText) ability.requirementsText = templates.requirementsText;

            if ("function" != typeof ability.reload) ability.reload = templates.reload;

            if ("function" != typeof ability.unload) ability.unload = templates.unload;

            if ("function" != typeof ability.abilityName) ability.abilityName = templates.abilityName;

            if ("function" != typeof ability.initialize) ability.initialize = templates.initialize;

            if ("function" != typeof ability.onCodeChanged) ability.onCodeChanged = templates.onCodeChanged;

            if ("function" != typeof ability.getDefaultShipCode) ability.getDefaultShipCode = templates.getDefaultShipCode;

            // pre-compile
            if ("function" == typeof ability.compile) try {
                ability.compile(this._this);
            }
            catch (e) {
                HelperFunctions.terminal.error(`Pre-compiler function for ${shipName} failed to execute.\nCaught Error: ${e.message}`);
            }

            // process ship codes
            ability.codes = {};
            ability.energy_capacities = {};
            for (let shipAbilityName in ability.models) try {
                let jsonData = JSON.parse(ability.models[shipAbilityName]);
                if (jsonData == null || jsonData.typespec == null) throw "No ship data or typespec";
                jsonData.level = jsonData.typespec.level = this.shipLevels;
                jsonData.model = --model;

                ability.codes[shipAbilityName] = jsonData.typespec.code = this.shipLevels * 100 + model;
                ability.energy_capacities[shipAbilityName] = Math.max(...jsonData.specs.generator.capacity);

                let allowRingOnModel;

                if (this.includeRingOnModel) {
                    if (ability.includeRingOnModel == null || "object" != typeof ability.includeRingOnModel) allowRingOnModel = !!ability.includeRingOnModel;
                    else allowRingOnModel = !!ability.includeRingOnModel[shipAbilityName];
                }
                else allowRingOnModel = false;

                if (allowRingOnModel) {
                    let ringModel = JSON.parse(JSON.stringify(this.ring_model));
                    let radius = this.model_conversion_ratio * ability.range / (+jsonData.size || 1);
                    ringModel.width = ringModel.height = [radius, radius - 10];
                    if (jsonData.bodies == null) jsonData.bodies = {};
                    jsonData.bodies.__ArenaModAbilityRangeRing__ = ringModel;
                }

                jsonData.typespec.__ABILITY_SYSTEM_INFO__ = __ABILITY_SYSTEM_INFO__;

                this.ship_codes.push(JSON.stringify(jsonData));
                this.zoomLevel[jsonData.typespec.code] = {
                    zoom: jsonData.zoom || 1,
                    radius: jsonData.typespec.radius || 1
                };
            }
            catch (e) {
                HelperFunctions.terminal.error(`Failed to compile ship code for model '${shipAbilityName}' of '${shipName}'.\nCaught Error: ${e.message}`);
            }

            ability.generatorInit = Math.min(1e5, Math.max(0, ability.generatorInit));

            if (isNaN(ability.generatorInit)) ability.generatorInit = ability.energy_capacities.default;
            
            if (!ability.codes.default) HelperFunctions.terminal.error(`Missing 'default' model for '${shipName}'.`);
            if (needAbilityShip && !ability.codes.ability) HelperFunctions.terminal.error(`'${shipName}' uses default ability behaviour but model 'ability' is missing.`);
        }

        if (this.ship_codes.length < 1) HelperFunctions.terminal.error(`No ships found. What the f*ck?`);

        this.ships_list = Object.keys(this.abilities).sort();
    },
    getAssignableShipsList: function (ship, forceUpdate = false) {
        let teamData = TeamManager.getDataFromShip(ship);
        if (forceUpdate || !Array.isArray(teamData.ships_list)) this.updateShipsList(teamData);
        return teamData.ships_list
    },
    updateShipsList: function (team) {
        let oldList = Array.isArray(team.ships_list) ? [...team.ships_list] : [];
        team.ships_list = [];
        let newList = [];
        let data = {};
        for (let ship of game.ships) {
            if (ship == null || ship.id == null || ship.custom.abilitySystemDisabled) continue;
            let t = TeamManager.getDataFromShip(ship);
            if (team.ghost ? !t.ghost : team.id !== t.id) continue;
            data[ship.custom.shipName] = (+data[ship.custom.shipName] || 0) + 1;
        }

        for (let abil of this.ships_list) {
            if ((+data[abil] || 0) < AbilityManager.abilities[abil].usageLimit) {
                team.ships_list.push(abil);
                let oldIndex = oldList.indexOf(abil);
                if (oldIndex < 0) newList.push(abil);
                else oldList.splice(oldIndex, 1);
            }
        }

        if ((oldList.length > 0 || newList.length > 0) && "function" == typeof this.onShipsListUpdate) this.onShipsListUpdate(team, newList, oldList);
        // update func:
        // team: team needs to be updated
        // newList: new allowed ships
        // oldList: new disabled ships
    },
    getShipCodes: function () {
        if (!Array.isArray(this.ship_codes)) this.initialize();
        return this.ship_codes;
    },
    random: function (ship, forced = false) {
        // select random ship
        return this.assign(ship, HelperFunctions.randomItem(this.getAssignableShipsList(ship)).value, false, forced);
    },
    abilities: ShipAbilities
}

this.__ABILITY_MANAGER_OPTIONS__ = {
    friendly_colors: GAME_OPTIONS.teams_count,
    hues: TeamManager.getAll().map(e => e ? e.hue : 0),
    custom_map: MapManager.get(true).map,
    max_players: GAME_OPTIONS.max_players
}

Object.defineProperty(this, 'options', {
    get () { return this.__ABILITY_MANAGER_OPTIONS__ },
    set (value) { return Object.assign(this.__ABILITY_MANAGER_OPTIONS__, value) }
});





/* Imported from misc/gameLogic.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */



/* Imported from misc/GameConfig.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const map_name = null; // leave `null` if you want randomized map name

Object.assign(GAME_OPTIONS, {
    duration: 30 * 60, // game duration in seconds
    points: 100, // points for one team to reach in order to win
    required_players: 2, // players required to start, min 2
    waiting_time: 30, // in seconds
    ship_ui_timeout: 30, // time for the ship ui to hide, in seconds
    max_players: 80,
    healing_ratio: 1, // better don't touch this
    crystal_drop: 0.5, // this.options.crystal_drop
    map_size: 100,
    radar_zoom: 1,
    buttons_cooldown: 0.25, // must wait after x (seconds) before the same button can be triggered again
    duplicate_choose_limit: 5, // immediately close the ship menu after a single ship has been choosen x times
    alienSpawns: {
        level: {
            min: 1,
            max: 2
        },
        codes: [10, 11, 13, 14, 16, 17, 18],
        collectibles: [10, 11, 12, 20, 21, 41, 42, 90, 91],
        crystals: {
            min: 45,
            max: 80
        },
        interval: 10, // in seconds
        capacity: 30, // number of aliens should be on map at a time (including aliens spawned by abilities),
        distanceFromBases: 30 // avoid spawning aliens <x> radius from the outer border of bases and control points
    },
    nerd: 10, // 🤓
    x: 10 // ?
});

const CONTROL_POINT = {
    neutral_color: "#fff", // color of control point when neutral, better don't change this
    neutral_fill: "hsla(0, 0%, 0%, 0)", // this is for displaying bar point
    position: {
        x: 0,
        y: 0
    },
    size: 65, // in radius
    control_bar: {
        percentage_increase: 3.5, // percentage of control point increased/decreased for each ship
        controlling_percentage: 66, // % of control one team needs in order to be a winning team
        dominating_percentage: 90 // % of control one team needs in order to dominate and gain points
    },
    score_increase: 0.1, // team points increases per sec for the dominating team
    player_multiplier: false, // when set to true, the increase is per player per sec, and not per sec anymore
    textures: [
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/capture_area.png",
            author: "Nexagon", // it's shown nowhere on the mod, but at least a token of respect
            scale: 2.24
        }
    ]
}

const BASES = {
    size: 45, // in radius
    intrusion_damage: 145, // damage per sec if enemy enters the base
    textures: [ // textures list to choose from (randomized)
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_0.png",
            author: "Nexagon", // it's shown nowhere on the mod, but at least a token of respect
            scale: 2.24
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_1.png",
            author: "Nexagon",
            scale: 2.24
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_2.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_3.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_4.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_5.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_6.png",
            author: "Caramel",
            scale: 2.07
        }
    ]
}

GAME_OPTIONS.required_players = Math.trunc(Math.max(GAME_OPTIONS.required_players, 2)) || 2; // restriction
CONTROL_POINT.control_bar.dominating_percentage = Math.min(Math.max(CONTROL_POINT.control_bar.controlling_percentage, CONTROL_POINT.control_bar.dominating_percentage), 100) || 100;





/* Imported from misc/Misc.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const GameHelperFunctions = {
    setSpawnpointsOBJ: function () {
        let teams = TeamManager.getAll(), mapName = MapManager.get().name;

        let samples = [...BASES.textures];
        let i = 0;
        for (let team of teams) {
            if (team == null || team.spawnpoint == null) continue;
            let spawnpoint = team.spawnpoint;

            if (samples.length < 1) samples = [...BASES.textures];

            let texture = team.texture;
            let index = texture != null ? BASES.textures.findIndex(txt => txt.url === texture.url) : -1;

            if (index < 0) {
                texture = HelperFunctions.randomItem(samples, true).value;
                index = BASES.textures.indexOf(texture);
            }
            else texture = BASES.textures[index];

            team.texture = texture;

            let hue = team.hue;

            let scale = BASES.size * texture.scale;

            HelperFunctions.setPlaneOBJ({
                id: "team_base_" + i,
                position: {
                    ...spawnpoint
                },
                scale: {
                    x: scale,
                    y: scale
                },
                rotation: {
                    x: Math.PI,
                    y: 0,
                    z: -Math.atan2(CONTROL_POINT.position.y - spawnpoint.y, CONTROL_POINT.position.x - spawnpoint.x)
                },
                type: {
                    id: "team_base_" + mapName + "_" + (i++) + "_" + index,
                    emissive: texture.url,
                    emissiveColor: HelperFunctions.toHSLA(hue)
                }
            })
        }
    },
    sendWaitingText: function (ship) {
        HelperFunctions.sendUI(ship, {
            id: "waiting_text",
            position: [40, 20, 20, 10],
            components: [
                { type: "text", position: [0, 0, 100, 50], value: "Waiting for more players...", color: "#cde"},
                { type: "text", position: [0, 50, 100, 50], value: String(game.custom.waiting_text).toString(), color: "#cde"}
            ]
        });
    },
    setControlPointOBJ: function (neutral = false, team, forced = false) {
        let { control_point_data } = game.custom;
        let scale = control_point_data.texture.scale * CONTROL_POINT.size;
        let lastState = game.custom.winner == null ? "neutral" : game.custom.winner;
        let curState = neutral ? "neutral" : team;
        if (!forced && lastState == curState) return;
        if (lastState != curState) HelperFunctions.removeObject("control_point_" + lastState);
        game.custom.winner = curState;
        let color = neutral ? CONTROL_POINT.neutral_color : HelperFunctions.toHSLA(TeamManager.getDataFromID(team).hue);
        HelperFunctions.setPlaneOBJ({
            id: "control_point_" + curState,
            position: {
                ...CONTROL_POINT.position
            },
            scale: {
                x: scale,
                y: scale
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            type: {
                id: "control_point_" + curState,
                emissive: control_point_data.texture.url,
                emissiveColor: color
            }
        });

        this.updateRadar();
    },
    updateRadar: function () {
        let color = (game.custom.winner == null || game.custom.winner == "neutral") ? CONTROL_POINT.neutral_color : HelperFunctions.toHSLA(TeamManager.getDataFromID(game.custom.winner).hue);
        let radar_components = [
            ...TeamManager.getAll().filter(t => t && t.spawnpoint != null).map(t => ({
                ...t.spawnpoint,
                size: BASES.size,
                color: HelperFunctions.toHSLA(t.hue)
            })),
            {
                ...CONTROL_POINT.position,
                size: CONTROL_POINT.size,
                character: "×",
                color
            }
        ];

        UIData.radar = {
            id: "radar_background",
            components: radar_components.map(info => {
                let radarSize = info.size * HelperFunctions.transform.zoom * 2;
                let textNodeSize = radarSize * HelperFunctions.transform.scale;
                let comps = [
                    { type: "round", position: [
                        HelperFunctions.transform.X(info.x, info.size, false),
                        HelperFunctions.transform.Y(info.y, info.size, false),
                        radarSize,
                        radarSize
                    ], width: 2, stroke: info.color}
                ];
                if (info.character != null) comps.push(
                    { type: "text", position: [
                        HelperFunctions.transform.X(info.x, info.size, true),
                        HelperFunctions.transform.Y(info.y, info.size, true),
                        textNodeSize,
                        textNodeSize
                    ], value: info.character, color: info.color}
                );
                return comps
            }).flat(Infinity)
        }

        HelperFunctions.sendUI(game, UIData.radar);
    },
    resetIntrusionWarningMSG: function (ship) {
        ship.custom.intrudedEnemyBaseStart = null;
        HelperFunctions.sendUI(ship, {
            id: "intrusion_warning",
            visible: false
        });
    },
    transform: {
        zoom: 10 / GAME_OPTIONS.map_size,
        scale: 1.5,
        X: function(x, size, textNode = false) {
            return this.positize((x + GAME_OPTIONS.map_size * 5 - size * (textNode ? this.scale : 1)) * this.zoom);
        },
        Y: function(y, size, textNode = false) {
            return this.positize((-y + GAME_OPTIONS.map_size * 5 - size * (textNode ? this.scale : 1)) * this.zoom);
        },
        positize: function (x) { return Math.max(x, 0) || 0 }
    },
    toTimer: function () {
        let seconds = HelperFunctions.timeLeft(game.custom.startedStep + GAME_OPTIONS.duration * 60);
        let minutes = Math.trunc(seconds / 60);
        seconds -= minutes * 60;
        if (minutes < 60) return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        let hours = Math.trunc(minutes / 60);
        minutes -= hours * 60;
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    canUseButtons: function (ship) {
        return !ship.custom.kicked && !ship.custom.shipUIsHidden;
    },
    intrudedOtherTeamBase: function (ship) {
        if (BASES.intrusion_damage <= 0 || !ship.alive) return false;

        let teams = TeamManager.getAll();
        let shipTeamID = TeamManager.getDataFromShip(ship).id;

        for (let team of teams) {
            if (team == null || team.id === shipTeamID) continue;
            let { spawnpoint } = team;
            if (spawnpoint == null) continue;
            if (HelperFunctions.distance(spawnpoint, ship).distance <= BASES.size) {
                return true;
            }
        }

        return false;
    }
}

Object.assign(HelperFunctions, GameHelperFunctions);

const WeightCalculator = {
    playerWeight: function (ship) {
        let kills = ship.custom.kills = +ship.custom.kills || 0;
        let deaths = ship.custom.deaths = +ship.custom.deaths || 0;

        return kills - deaths / 3;
    },
    getTopPlayers: function (game, donSort = false) {
        let players = game.ships.filter(e => (e || {}).id != null && !e.custom.kicked);
        if (donSort) return players;
        return players.sort((a, b) => this.playerWeight(b) - this.playerWeight(a));
    },
    getTeamPlayersCount: function (id) {
        let teamData = TeamManager.getDataFromID(id);
        let res = 0;
        for (let ship of game.ships) {
            if ((ship || {}).id == null || !ship.custom.joined || ship.custom.kicked) continue;

            let shipTeam = TeamManager.getDataFromShip(ship);

            res += teamData.ghost ? shipTeam.ghost : (shipTeam.id === teamData.id);
        }
        
        return res;
    },
    teamWeight: function (id) {
        return this.getTeamPlayersCount(id);
    },
    getTeamsWeights: function () {
        return TeamManager.getAll().map(team => ({
            id: team.id, weight: this.teamWeight(team.id)
        })).sort((t1, t2) => {
            if (t1.weight == t2.weight) return HelperFunctions.randInt(2) || -1;
            return t1.weight - t2.weight;
        })
    },
    joinBalanceTeam: function (ship) {
        // disable team balance for team-based root mode because modding works weird for mods with root mode "team"
        if (game.options.root_mode == "team") return;

        TeamManager.set(ship, this.getTeamsWeights()[0].id, true, true);
    }
}

const UIData = {
    colorTextLightness: 65,
    scoreIncreaseRouding: (String(CONTROL_POINT.score_increase).match(/\..*/) || ["a"])[0].length - 1,
    control_bar: {
        id: "POINT_BAR",
        visible: false
    },
    radar: {
        id: "radar_background",
        visible: false
    },
    scores: {
        id: "team_points",
        visible: false
    },
    scoreboard: {
        id: "scoreboard",
        visible: true,
        components: [
            {type: "text",position:[15,0,70,10],value:"Waiting for more players...",color:"#cde"}
        ]
    },
    player_count: {
        id: "player_count",
        visible: false
    },
    blockers: {
        rebuild: function () {
            // rebuild score block
            let buildHue = parseInt(__ABILITY_SYSTEM_INFO__.buildID, 16) % 360, scoreBlock = {
                id: "score_block",
                position: [4,3,12,6],
                components:[
                    {type:'box',position:[0,0,100,100],fill:"black", stroke: HelperFunctions.toHSLA(buildHue), width: 2},
                    {type:'box',position:[0,0,100,100],fill: HelperFunctions.toHSLA(buildHue, 0.25)},
                    {type: "text", position: [5,5,90,45], value: `Re:Arena (${__ABILITY_SYSTEM_INFO__.branch}) v${__ABILITY_SYSTEM_INFO__.version}`, color: HelperFunctions.toHSLA(buildHue)},
                    {type: "text", position: [5,50,90,45], value: `Build ID: ${__ABILITY_SYSTEM_INFO__.buildID}`, color: HelperFunctions.toHSLA(buildHue)}
                ]
            };
            let index = this.list.findIndex(ui => ui.id == "score_block");
            if (index == -1) this.list.push(scoreBlock);
            else this.list[index] = scoreBlock;

            // rebuild map info
            let map = MapManager.get();
            let mapInfo = {
                id: "map_info",
                position: [1, 90, 10, 5],
                components: [
                    {type: "text", position: [0,0,100,50], value: `${map.name} Map`, color: '#cde', align: "left"},
                    {type: "text", position: [0,50,100,50], value: `By ${map.author}`, color: '#cde', align: "left"}
                ]
            };
            let mapIndex = this.list.findIndex(ui => ui.id == "map_info");
            if (mapIndex == -1) this.list.push(mapInfo);
            else this.list[mapIndex] = mapInfo;
        },
        list: [
            {
                id: "buy_lives_blocker",
                visible: true,
                clickable: true,
                shortcut: String.fromCharCode(187),
                position: [65,0,10,10],
                components: []
            },
            {
                id: "steam_exit_block",
                position:[0,95,20,5],
                clickable: true
            }
        ],
        initialized: false,
        set: function (ship, forceRebuild) {
            if (forceRebuild || !this.initialized) {
                this.rebuild();
                this.initialized = true;
            }
            if (ship != null) for (let ui of this.list) HelperFunctions.sendUI(ship, ui)
        },
        has: function (id) {
            return !!this.list.find(ui => ui.id === id)
        }
    },
    shipUIs: {
        shortcut: "V",
        toggleID: "toggle_choose_ship",
        shipSelectPrefix: "choose_ship_",
        shipSelectSize: {
            textLength: 35, // to keep the text looks pretty and aligned
            itemsPerLine: 4,
            xStart: 21,
            yStart: 19,
            xEnd: 79,
            yEnd: 85,
            margin_scale_x: 1/8, // comparing to button width
            margin_scale_y: 1/6, // comparing to button height
        },
        positionCache: {},
        styles: {
            selected: {
                borderColor: "#AAFF00",
                textColor: "#AAFF00",
                borderWidth: 8,
                bgColor: "rgba(170, 225, 0, 0.25)"
            },
            default: {
                borderColor: "#FFFFFF",
                textColor: "#FFFFFF",
                borderWidth: 2,
                bgColor: `rgba(68, 85, 102, 0.25)`
            },
            disabled: {
                borderColor: "hsla(0, 100%, 50%, 1)",
                textColor: "#fff",
                borderWidth: 8,
                bgColor: "hsla(0, 100%, 50%, 0.25)"
            }
        },
        openUI: function (ship, show) {
            HelperFunctions.sendUI(ship, {
                id: this.toggleID,
                visible: show,
                clickable: show,
                position: [3,30,15,10],
                shortcut: this.shortcut,
                components: [
                    { type:"box",position:[0,0,100,100],fill:"rgba(68, 85, 102, 0.5)",stroke:"#FFFFFF",width:2},
                    { type: "text",position:[5,20,90,60],value: `${ship.custom.shipUIsHidden ? "Open" : "Close"} ship selection [${this.shortcut}]`, color:"#FFFFFF"},
                ]
            });
        },
        toggle: function (ship, perma = false, firstOpen = false) {
            // perma means also hides the choose ship button
            // first open to assign starting tick
            if (!game.custom.started || !game.custom.abilitySystemEnabled || ship.custom.abilitySystemDisabled) {
                firstOpen = false;
                perma = true;
            }
            if (!firstOpen && ship.custom.shipUIsPermaHidden) return;
            let isHidden = perma || firstOpen || !ship.custom.shipUIsHidden;
            if (perma) {
                ship.custom.shipUIsPermaHidden = true;
            }
            if (firstOpen) {
                ship.custom.shipUIsPermaHidden = false;
                ship.custom.lastSpawnedStep = game.step;
            }
            let oldHidden = ship.custom.shipUIsHidden;
            ship.custom.shipUIsHidden = isHidden;
            if (oldHidden !== isHidden || perma || firstOpen) this.openUI(ship, !perma);
            if (oldHidden !== isHidden) this.toggleSelectMenu(ship);
        },
        sendIndividual: function (ship, position, name, stylePreset, id = null, shortcut = null) {
            let { bgColor, borderColor, borderWidth, textColor } = this.styles[stylePreset];
            if (!id) id = this.shipSelectPrefix + name;
            let visible = true;
            position = this.positionCache[name] = position == null ? this.positionCache[name] : position;
            if (position == null) visible = false;
            HelperFunctions.sendUI(ship, {
                id,
                position,
                visible,
                shortcut,
                clickable: stylePreset == "default",
                components: [
                    { type: "box", position: [0, 0, 100, 100], fill: bgColor, stroke: borderColor,width: borderWidth},
                    { type: "text", position: [0, 0, 100, 100], value: HelperFunctions.fill(name, this.shipSelectSize.textLength), color: textColor}
                ]   
            });
        },
        toggleSelectMenu: function (ship) {
            let visible = !ship.custom.shipUIsHidden;
            let abilities = AbilityManager.ships_list;

            if (!visible) {
                for (let abil of abilities) HelperFunctions.sendUI(ship, { id: this.shipSelectPrefix + abil, visible: false });
                HelperFunctions.sendUI(ship, {id: "next_ship", visible: false});
                HelperFunctions.sendUI(ship, {id: "prev_ship", visible: false});
                return;
            }

            let UISpec = this.shipSelectSize;
            let itemsPerLine = UISpec.itemsPerLine;
            let itemsPerColumn = Math.ceil(abilities.length / itemsPerLine);

            let width = (UISpec.xEnd - UISpec.xStart) / (itemsPerLine + (itemsPerLine - 1) * UISpec.margin_scale_x);
            let height = (UISpec.yEnd - UISpec.yStart) / (itemsPerColumn + (itemsPerColumn - 1) * UISpec.margin_scale_y);

            let lastLineXOffset = (itemsPerLine - (abilities.length % itemsPerLine || itemsPerLine)) * width * (1 + UISpec.margin_scale_x) / 2;

            let i = 0;
            let canUseUI = HelperFunctions.canUseButtons(ship) && !AbilityManager.isActionBlocked(ship).blocked;

            for (let abil of abilities) {
                let row = Math.trunc(i / itemsPerLine), column = i % itemsPerLine;
                let offsetX = row == itemsPerColumn - 1 ? lastLineXOffset : 0;
                let usable = canUseUI && AbilityManager.assign(ship, abil, true).success;
                let style = "";
                if (ship.custom.shipName == abil) style = "selected";
                else if (usable) style = "default";
                else style = "disabled";

                this.sendIndividual(ship, [
                    offsetX + UISpec.xStart + column * width * (UISpec.margin_scale_x + 1),
                    UISpec.yStart + row * height * (UISpec.margin_scale_y + 1),
                    width,
                    height
                ], abil, style);
                ++i;
            }

            this.sendIndividual(ship, [
                UISpec.xStart,
                UISpec.yEnd + height * UISpec.margin_scale_y * 2,
                width,
                95 - (UISpec.yEnd + height * UISpec.margin_scale_y * 2)
            ], "[ Previous ship", canUseUI ? "default" : "disabled", "prev_ship", String.fromCharCode(219));

            this.sendIndividual(ship, [
                UISpec.xEnd - width,
                UISpec.yEnd + height * UISpec.margin_scale_y * 2,
                width,
                95 - (UISpec.yEnd + height * UISpec.margin_scale_y * 2)
            ], "Next ship ]", canUseUI ? "default" : "disabled", "next_ship", String.fromCharCode(221));
        }
    },
    updatePlayerCount: function (game) {
        let players = WeightCalculator.getTopPlayers(game, true);

        let teams = TeamManager.getAll();
        let team_counts = new Array(teams.length).fill(0), ghost_count = 0;

        for (let player of players) {
            let teamInfo = TeamManager.getDataFromShip(player);

            if (teamInfo.ghost) ++ghost_count;
            else ++team_counts[teamInfo.id];
        }

        let colon_width = 0.25; // ratio to counter

        let single_equiv = 1 + colon_width; // 1: own width, colon_width: the ":" width

        let width_equiv = teams.length * single_equiv; 
        if (ghost_count > 0) width_equiv += single_equiv;

        width_equiv -= colon_width;

        let width = 100 / width_equiv;

        let compos = [
            {type: "text", position: [0, 0, 100, 25], value: "Players distribution", color: "#cde"}
        ];

        // render team ratio
        let i = 0;
        team_counts.forEach((count) => {
            let offsetX = i * width * single_equiv;
            compos.push(
                { type: "text", position: [offsetX, 25, width, 25], value: count, color: HelperFunctions.toHSLA(teams[i].hue, 1, 100, this.colorTextLightness) },
                { type: "text", position: [offsetX + width, 25, width * colon_width, 25], value: ":", color: "#cde" }
            );
            ++i;
        });

        if (ghost_count > 0) {
            let offsetX = i * width * single_equiv;
            compos.push(
                { type: "text", position: [offsetX, 25, width, 25], value: ghost_count, color: HelperFunctions.toHSLA(TeamManager.ghostTeam.hue, 1, 100, this.colorTextLightness) }
            );
        }
        else compos.pop();

        // render chart
        let chart_width = 100 / (teams.length + (ghost_count > 0));
        let largest_team_count = Math.max(...team_counts, ghost_count);

        i = 0;
        for (let count of team_counts) compos.push(
            { type: "box", position: [i * chart_width, 50, chart_width, 50 * ((count / largest_team_count) || 0)], fill: HelperFunctions.toHSLA(teams[i++].hue) }
        );

        if (ghost_count > 0) compos.push(
            { type: "box", position: [i * chart_width, 50, chart_width, 50 * ghost_count / largest_team_count], fill: HelperFunctions.toHSLA(TeamManager.ghostTeam.hue) }
        );

        this.player_count = {
            id: "player_count",
            position: [85, 40, 10, 10],
            components: compos
        }

        this.renderPlayerCount(game);
    },
    renderPlayerCount: function (ship) {
        HelperFunctions.sendUI(ship, this.player_count);
    },
    updateScoreboard: function (game) {
        if (game.custom.started) {
            let players = WeightCalculator.getTopPlayers(game).slice(0, 10);
            let columnHeight = 100 / 11;
            let textHeight = columnHeight / 1.2;
            let offsetY = (columnHeight - textHeight) / 2;
            this.scoreboard.components = [
                {type: "box", position:[0,0,100,columnHeight], fill: "hsla(210, 20%, 33%, 1)"},
                {type: "text", position: [0,offsetY,100,textHeight], color: "#cde", value: " Players", align: "left"},
                {type: "text", position: [0, offsetY, 100, textHeight], color: "#cde", value: "K/D ", align: "right"},
                {type: "text", position: [0,offsetY,100,textHeight], color: "#cde", value: " "}, // player component scale
                ...players.map((player, index) => {
                    let pos = [0, offsetY + columnHeight * (index + 1), 100, textHeight];
                    let color = HelperFunctions.toHSLA(TeamManager.getDataFromShip(player).hue, 1, 100, this.colorTextLightness)
                    return [
                        { type: "player", index, id: player.id, position: pos, color, align: "left"},
                        { type: "text", value: `${player.custom.kills}/${player.custom.deaths} `, position: pos, color, align: "right"},
                    ]
                }).flat()
            ]
        }

        this.updatePlayerCount(game);

        for (let ship of game.ships) {
            if (ship && ship.id != null) this.renderScoreboard(ship);
        }
    },
    renderScoreboard: function (ship) {
        if (ship == null || ship.id == null) return;
        if (ship.custom.kicked) return HelperFunctions.sendUI(ship, {
            id: "scoreboard",
            components: [
                { type: "text", position: [0, 45, 100, 10], value: "You've been kicked!", color: "#cde" }
            ]
        });
        let scoreboardData = { ...this.scoreboard };
        if (game.custom.started) {
            // highlight players
            let compos = HelperFunctions.clone(scoreboardData.components);
            let foundIndex = compos.findIndex(c => c.type == "player" && c.id === ship.id);
            if (foundIndex < 0) {
                let color = HelperFunctions.toHSLA(TeamManager.getDataFromShip(ship).hue, 1, 100, this.colorTextLightness);
                foundIndex = compos.findLastIndex(c => c.type == "player");
                compos[foundIndex].id = ship.id;
                compos[foundIndex].color = color;
                compos[foundIndex + 1].value = `${ship.custom.kills}/${ship.custom.deaths} `;
                compos[foundIndex + 1].color = color;
            }
            compos.splice(foundIndex, 0, { type: "box", position: [0, (compos[foundIndex].index + 1) * 100 / 11, 100, 100 / 11], fill: "hsla(210, 24%, 29%, 0.5)" });
            scoreboardData.components = compos;
        }
        HelperFunctions.sendUI(ship, scoreboardData);
    },
    renderTeamScores: function (ship, forceUpdate = false) {
        if (forceUpdate && game.custom.started) {
            let increaseAmount = 0;
            try { increaseAmount = game.custom.increaseAmount.toFixed(this.scoreIncreaseRouding) } catch (e) {}
            UIData.scores = {
                id: "team_points",
                position: [35,11.5,30,5],
                components: []
            };
            let teams_count = GAME_OPTIONS.teams_count;
            let ghostTeamScore = Math.floor(control_point_data.ghostScore);
            let ghostTeamShow = ghostTeamScore > 0;
            if (ghostTeamShow) ++teams_count;
            let UI_counts = teams_count * 2 - 1;
            let width = 100 / UI_counts;
            let dash = { type: "text", value: "-", color: "#fff"};
            let index = 0;
            UIData.scores.components = control_point_data.scores.map((score, id) => {
                let color = HelperFunctions.toHSLA(TeamManager.getDataFromID(id).hue, 1, 100, this.colorTextLightness);
                let data = [
                    { type: "text", position: [index * width, 0, width, 100], value: Math.floor(score), color}
                ];
                if (game.custom.scoreIncreased && id === game.custom.winner) data.push(
                    { type: "text", position: [index * width, 0, width, 100 / (teams_count + 1)], value: "+" + increaseAmount, color, align: "right"}
                );

                data.push( { ...dash, position: [(index + 1) * width, 0, width, 100]});

                index += 2;

                return data;
            }).flat(Infinity);

            if (ghostTeamShow) {
                let color = HelperFunctions.toHSLA(TeamManager.ghostTeam.hue, 1, 100, this.colorTextLightness);
                let data = [
                    { type: "text", position: [index * width, 0, width, 100], value: ghostTeamScore, color}
                ];
                if (game.custom.scoreIncreased && "ghost" == game.custom.winner) data.push(
                    { type: "text", position: [(index + 3/4) * width, 0, width * 1 / 4, 25], value: "+" + increaseAmount, color}
                );
                UIData.scores.components.push(...data);
            }
            else UIData.scores.components.pop();
        };
        HelperFunctions.sendUI(ship, UIData.scores);
    },
    assign: function (ship, name) {
        let oldName = ship.custom.shipName;
        let res = AbilityManager.assign(ship, name);
        if (res.success) {
            AbilityManager.restore(ship);
            ship.set({ vx: 0, vy: 0 });
            let x = (ship.custom.chooseTimes[ship.custom.shipName] || 0) + 1;
            if (x >= GAME_OPTIONS.duplicate_choose_limit) return this.shipUIs.toggle(ship, true);
            ship.custom.chooseTimes[ship.custom.shipName] = x;
            if (oldName != ship.custom.shipName) {
                this.shipUIs.sendIndividual(ship, null, ship.custom.shipName, "selected");
                this.shipUIs.sendIndividual(ship, null, oldName, AbilityManager.getAssignableShipsList(ship).includes(oldName) ? "default" : "disabled");
            }
        }
    }
}

const renderData = function (ship, forceUpdate = false) {
    // here we render control distribution

    if (forceUpdate) {
        let BarUI = {
            id: "POINT_BAR",
            position: [35,2.5,30,5], // x y width height
            visible: true,
            components: [
                // control distribution will be inserted here
                { type:"box",position:[0,50,100,50],fill:"rgba(0, 0, 0, 0)",stroke:"#FFFFFF",width:2},
                { type: "text",position:[30,0,40,45],value:"Control Point Capture",color:"#FFFFFF"}
            ]
        }

        let compos = [];
        let offset = 0;
        control_point_data.teams.forEach((control, index) => {
            if (control <= 0) return; // skip 0% team
            compos.push([offset, control, HelperFunctions.toHSLA(TeamManager.getDataFromID(index).hue)]);
            offset += control;
        });

        if (control_point_data.ghost > 0) {
            compos.push([offset, control_point_data.ghost, HelperFunctions.toHSLA(TeamManager.ghostTeam.hue)]);
            offset += control_point_data.ghost;
        }

        if (control_point_data.neutral > 0) {
            compos.push([offset, control_point_data.neutral, CONTROL_POINT.neutral_fill]);
        }

        BarUI.components.splice(-2, 0, ...compos.map(info => ({
            type: "box",
            position: [info[0], 50, info[1], 50],
            fill: info[2]
        })));

        UIData.control_bar = BarUI;
    }

    HelperFunctions.sendUI(ship, UIData.control_bar);
}

let control_point_data = game.custom.control_point_data;
if (control_point_data == null) game.custom.control_point_data = control_point_data = {
    teams: new Array(GAME_OPTIONS.teams_count).fill(0),
    scores: new Array(GAME_OPTIONS.teams_count).fill(0),
    ghost: 0,
    ghostScore: 0,
    neutral: 100
}

control_point_data.renderData = renderData;

let AlienSpawns = [];

const makeAlienSpawns = function () {
    let { map } = MapManager.get(), teams = TeamManager.getAll().map(e => e.spawnpoint).filter(e => e != null);

    let actual_size = GAME_OPTIONS.map_size * 5;

    let dist = GAME_OPTIONS.alienSpawns.distanceFromBases;
    
    // mapping first with positions
    map = map.split("\n").map((v, y) => v.split("").map((size, x) => ({
        x: x * 10 - actual_size + 5,
        y: actual_size - y * 10 - 5,
        size: +size || 0
    }))).flat();

    // filter positions
    map = map.filter(pos => {
        if (pos.size > 0) return false;

        if (HelperFunctions.distance(CONTROL_POINT.position, pos).distance <= CONTROL_POINT.size + dist) return false;

        for (let team of teams) {
            if (HelperFunctions.distance(team, pos).distance <= BASES.size + dist) return false;
        }

        return true;
    });

    AlienSpawns = map;
}

AbilityManager.onShipsListUpdate = function (team, newList, oldList) {
    for (let s of game.ships) {
        if (s == null || s.id == null || s.custom.shipUIsPermaHidden || s.custom.shipUIsHidden || s.custom.inAbility || AbilityManager.isAbilityBlocked(s).blocked) continue;
        let x = TeamManager.getDataFromShip(s), playerShipName = s.custom.shipName;
        if (team.ghost ? !x.ghost : team.id !== x.id) continue; // wrong team

        // update ship usage limit UIs
        
        for (let name of oldList) if (playerShipName != name) UIData.shipUIs.sendIndividual(s, null, name, "disabled");
        for (let name of newList) if (playerShipName != name) UIData.shipUIs.sendIndividual(s, null, name, "default");
    }
}

AbilityManager.onAbilityEnd = function (ship) {
    if (!ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}

AbilityManager.onAbilityStart = function (ship, inAbilityBeforeStart) {
    if (!inAbilityBeforeStart && !ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}

AbilityManager.onActionBlockStateChange = function (ship) {
    if (!ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}






/* Imported from misc/tickFunctions.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const alwaysTick = function (game) {
    AbilityManager.globalTick(game);
    let IDs = [];
    for (let ship of game.ships) {
        if (ship == null || ship.id == null) continue;
        if (!ship.custom.joined) {
            // ban check
            let banned = false;
            if (DEBUG) for (let info of game.custom.banList) {
                let name = String(ship.name).toLowerCase();
                if (info.full ? name == info.phrase : name.includes(info.phrase)) {
                    banned = true;
                    game.custom.abilitySystemCommands.kick(ship, "You have been banned by the map host", "Blacklisted player name");
                    break;
                }
            }

            if (!banned) {
                UIData.blockers.set(ship);
                WeightCalculator.joinBalanceTeam(ship);
                control_point_data.renderData(ship, false);
                UIData.renderTeamScores(ship);
                HelperFunctions.sendUI(ship, UIData.radar);
                AbilityManager.restore(ship);
                if (game.custom.started) {
                    ship.custom.allowInstructor = true;
                }
                else {
                    HelperFunctions.sendWaitingText(ship);
                    ship.set({ idle: true, collider: false, vx: 0, vy: 0 });
                }
                ship.custom.kills = ship.custom.deaths = 0;
                ship.custom.chooseTimes = {};
                UIData.shipUIs.toggle(ship, false, true);
            }

            ship.custom.joined = true;
        }

        let spawnpoint, stepDifference = game.step - ship.custom.lastSpawnedStep;
        if ( // Don't ask why
            !ship.custom.shipUIsPermaHidden && (
                stepDifference > GAME_OPTIONS.ship_ui_timeout * 60 || (
                    stepDifference > 1 * 60 &&
                    (spawnpoint = TeamManager.getDataFromShip(ship).spawnpoint) != null &&
                    HelperFunctions.distance(spawnpoint, ship).distance > BASES.size
                )
            )
        ) UIData.shipUIs.toggle(ship, true);

        IDs.push(ship.id);

        let intruded = HelperFunctions.intrudedOtherTeamBase(ship);
        if (intruded) {
            if (ship.custom.intrudedEnemyBaseStart == null) {
                ship.custom.intrudedEnemyBaseStart = game.step;
                HelperFunctions.sendUI(ship, {
                    id: "intrusion_warning",
                    position: [20, 20, 60, 5],
                    components: [
                        { type: "text", position: [0, 0, 100, 100], value: "WARNING! ENEMY BASE INTRUSION WILL CAUSE DAMAGE TO YOUR OWN SHIP!", color: "#ffff00" }
                    ]
                });
            }
            else if ((game.step - ship.custom.intrudedEnemyBaseStart) % 60 === 0) HelperFunctions.damage(ship, BASES.intrusion_damage);
        }
        else if (ship.custom.intrudedEnemyBaseStart != null) HelperFunctions.resetIntrusionWarningMSG(ship);
    }

    let arIDs = [...IDs];
    if (Array.isArray(game.custom.ids)) {
        let i = 0;
        while (i < IDs.length) {
            let id = IDs[i];
            let oldIndex = game.custom.ids.indexOf(id);
            if (oldIndex >= 0) {
                IDs.splice(i, 1);
                game.custom.ids.splice(oldIndex, 1);
            }
            else ++i;
        }
    }
    else game.custom.ids = IDs;
    if (IDs.length > 0 || game.custom.ids.length > 0) UIData.updateScoreboard(game);
    
    game.custom.ids = arIDs;

    if (game.custom.last_map != MapManager.get()) initialization(game, true);
}

const initialization = function (game, dontChangeTick = false) {
    if (!game.custom.centerObjPlaced) {
        var center_obj = HelperFunctions.randInt(GAME_OPTIONS.nerd) ? {
            scale: {x:4, y:4, z:4},
            rotation: {x:0, y:0, z:0},
            type: {
                id: "lost_sector_aries",
                obj: "https://starblast.io/lost_sector/LostSector_Aries_HardEdges.obj",
                diffuse: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Diffuse.jpg",
                bump: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Height.jpg",
                specular: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Specular.jpg",
                shininess: 0,
                emissiveColor: 0,
                specularColor: 0x3fcf00,
                transparent: false
            }
        } : {
            scale: {x: 20, y: 20, z: 20},
            rotation: {x: -Math.PI/4, y: -Math.PI/4, z: 0},
            type: {
                id: "nerd_vibraphone",
                obj: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/objs/nerd_vibraphone.obj",
                diffuse: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/ship_lambert_texture.png",
                emissive: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/ship_emissive_texture.png",
                transparent: false
            }
        };

        HelperFunctions.setObject({
            id: "center_obj",
            position: {x:0, y:0, z:-90},
            ...center_obj
        });

        game.custom.centerObjPlaced = true;
    }

    let texture = control_point_data.texture;
    let index = texture == null ? -1 : CONTROL_POINT.textures.findIndex(txt => txt.url === texture.url);
    if (index < 0) index = HelperFunctions.randomItem(CONTROL_POINT.textures).index;
    control_point_data.texture = CONTROL_POINT.textures[index];
    
    
    HelperFunctions.setControlPointOBJ(true, false, true);

    HelperFunctions.setSpawnpointsOBJ();

    HelperFunctions.updateRadar();

    makeAlienSpawns();

    UIData.blockers.set(game, true);

    game.custom.last_map = MapManager.get();

    // rekick the kicked players

    for (let ship of game.ships) {
        if ((ship || {}).id != null && ship.custom.kicked) game.custom.abilitySystemCommands.kick(ship)
    }

    if (!dontChangeTick) {
        this.tick = waiting;
        this.tick(game);
    }
}

const waiting = function (game) {
    alwaysTick(game);
    let players = game.ships.filter(ship => ship && ship.id != null);
    let text = "";
    if (players.length >= GAME_OPTIONS.required_players) {
        if (game.custom.waiting_time == null || isNaN(game.custom.waiting_time)) game.custom.waiting_time = game.step + GAME_OPTIONS.waiting_time * 60;
        if (game.step > game.custom.waiting_time) {
            // game started
            game.custom.started = true;
            game.custom.abilitySystemEnabled = true;
            UIData.renderTeamScores(game, true);
            UIData.updateScoreboard(game);
            HelperFunctions.sendUI(game, UIData.radar);
            players.forEach(ship => {
                HelperFunctions.sendUI(ship, {
                    id: "waiting_text",
                    visible: false
                });
                ship.custom.allowInstructor = true;
                if ((ship || {}).id == null || ship.custom.kicked) return;
                AbilityManager.random(ship);
                UIData.shipUIs.toggle(ship, false, true);
                ship.set({ idle: false, collider: true });
            });
            if (game.custom.startedStep == null) game.custom.startedStep = game.step + 1;
            return this.tick = main_phase;
        }
        else {
            // not the time yet
            text = HelperFunctions.timeLeft(game.custom.waiting_time);
        }
    }
    else {
        // not enough players
        game.custom.waiting_time = null;
        text = `${players.length}/${GAME_OPTIONS.required_players} players required`;
    }

    if (text != game.custom.waiting_text) {
        game.custom.waiting_text = text;
        HelperFunctions.sendWaitingText(game);
    }
}

const main_phase = function (game) {
    alwaysTick(game);
    if ((game.step - game.custom.startedStep) % 60 === 0) {
        // game logic should be inside here
        // find all players inside the ring
        let players = HelperFunctions.findEntitiesInRange(CONTROL_POINT.position, CONTROL_POINT.size, true, true, { ships: true }, true);

        let increment = CONTROL_POINT.control_bar.percentage_increase;

        // if there are no players in the ring, gain back control depends on number of controlling teams
        if (players.length < 1) {
            // yeah, why to gain back when it's already all neutral?
            if (control_point_data.neutral < 100) {
                for (let i = 0; i < GAME_OPTIONS.teams_count; ++i) {
                    let percentage = control_point_data.teams[i];
                    if (percentage <= 0) percentage = 0;
                    else {
                        // take back control by min(increment, current control on team)
                        if (percentage <= increment) {
                            control_point_data.neutral += percentage;
                            percentage = 0;
                        }
                        else {
                            control_point_data.neutral += increment;
                            percentage -= increment;
                        }
                    }
                    control_point_data.teams[i] = percentage;
                }
                
                let ghost_control = control_point_data.ghost;

                if (ghost_control <= 0) ghost_control = 0;
                else {
                    // same here, but ghost team
                    if (ghost_control <= increment) {
                        control_point_data.neutral += ghost_control;
                        ghost_control = 0;
                    }
                    else {
                        control_point_data.neutral += increment;
                        ghost_control -= increment;
                    }
                }

                control_point_data.ghost = ghost_control;
            }

            // control cap at 100%
            control_point_data.neutral = Math.min(control_point_data.neutral, 100);
        }
        else {
            // if there are players, calculate control

            if (control_point_data.neutral > 0) {
                // if the point still has its own control, steal it
                let total_control_lost = players.length * increment;
                if (total_control_lost > control_point_data.neutral) {
                    // steal from neutral too much?
                    increment = control_point_data.neutral / players.length;
                    control_point_data.neutral = 0;
                }
                else {
                    // nah, it's fine
                    control_point_data.neutral -= total_control_lost;
                }

                // benefit!
                for (let ship of players) {
                    let TeamData = TeamManager.getDataFromShip(ship);
                    if (!TeamData.ghost) control_point_data.teams[TeamData.id] += increment;
                    else control_point_data.ghost += increment;
                }
            }
            else {
                // just let teams steal control from each other

                // first, calculate number of ships and previous control % on each team
                let ghostData = {
                    index: "ghost",
                    control: control_point_data.ghost,
                    steal_amount: increment,
                    ships: 0
                }, teamControls = [
                    ...control_point_data.teams.map((control, index) => ({
                        index,
                        control,
                        steal_amount: increment, // % control loss per ship disadvantage
                        // later the value above would be lower if the "cake" is too small
                        ships: 0
                    })),
                    ghostData
                ];
                for (let ship of players) {
                    let TeamData = TeamManager.getDataFromShip(ship);
                    if (!TeamData.ghost) ++teamControls[TeamData.id].ships;
                    else ++ghostData.ships
                }

                // sorting from smallest team to largest team (by ship count)
                // also filter out teams with 0% control and 0 ships
                teamControls = teamControls.filter(team => team.control > 0 || team.ships > 0).sort((a, b) => a.ships - b.ships);

                // stealing time

                // This is an updated algorithm with only one loop required
                // The algorithm is still the same comparing to old algorithm,
                // it's just that the old one has 2 nested loops that may decrease performance (altho not much significant)
                // and also, credits to @victorz#5357 on Discord (GitHub @theonlypwner) for helping me implement this new approach
                // For old approach with 2 nested loops, see here: https://pastebin.com/APfrRW9Y

                let shipsNotBeforeCurrent = players.length;
                let controlGainPerShip = 0; // control amount gained per ships on the winning team
                let controlPenalty = 0;
                // since total control gain is steal_amount * (ships_count - losing_team_ships_count)
                // `controlPenalty` will be the sum of steal_amount * losing_team_ships_count
                // and it might stack up after each loop

                teamControls.forEach((teamControl, index) => {
                    let ships_disadvantage = shipsNotBeforeCurrent - teamControl.ships * (teamControls.length - index);

                    teamControl.control += controlGainPerShip * teamControl.ships - controlPenalty;

                    if (ships_disadvantage > 0) {
                        // how much will it lose?
                        let total_loss = Math.min(teamControl.control, ships_disadvantage * increment);

                        teamControl.control -= total_loss;

                        // later ships need to gain total_loss / ships_disadvantage * (laterTeam.ships - teamControl.ships)
                        total_loss /= ships_disadvantage;
                        controlGainPerShip += total_loss;
                        controlPenalty += total_loss * teamControl.ships;
                    }

                    shipsNotBeforeCurrent -= teamControl.ships;

                    // update control result
                    teamControl.control = Math.min(100, teamControl.control);
                    
                    if (teamControl.index == "ghost") control_point_data.ghost = teamControl.control;
                    else control_point_data.teams[teamControl.index] = teamControl.control;
                });
            }
        }

        let maxControlTeam = [], maxControl = 0;

        // get the team(s) with highest control
        control_point_data.teams.forEach((control, index) => {
            if (control > maxControl) {
                maxControl = control;
                maxControlTeam = [index];
            }
            else if (maxControl == control) maxControlTeam.push(index);
        });

        if (control_point_data.ghost > maxControl) {
            maxControl = control_point_data.ghost;
            maxControlTeam = ["ghost"];
        }
        else if (maxControl == control_point_data.ghost) maxControlTeam.push("ghost");

        let scoreIncreased = false;

        // if there are team(s) with highest control meets the requirements
        // and ONLY one team has that control percentage
        // that team is winning
        if (maxControl >= CONTROL_POINT.control_bar.controlling_percentage && maxControlTeam.length == 1) {
            let winningTeam = maxControlTeam[0];
            HelperFunctions.setControlPointOBJ(false, winningTeam);
            if (maxControl >= CONTROL_POINT.control_bar.dominating_percentage) {
                scoreIncreased = true;
                let mult = 1;
                if (CONTROL_POINT.player_multiplier) {
                    let winningTeamInfo = TeamManager.getDataFromID(winningTeam);
                    mult = winningTeamInfo.ghost ? 1 : players.filter(s => TeamManager.getDataFromShip(s).id === winningTeamInfo.id).length;
                }
                let increaseAmount = game.custom.increaseAmount = CONTROL_POINT.score_increase * mult;
                if (winningTeam == "ghost") control_point_data.ghostScore += increaseAmount;
                else control_point_data.scores[winningTeam] += increaseAmount;
            }
        }
        else HelperFunctions.setControlPointOBJ(true); // or else it's still neutral

        // show results to players
        control_point_data.renderData(game, true);

        // show scores
        if (scoreIncreased || scoreIncreased != game.custom.scoreIncreased) {
            game.custom.scoreIncreased = scoreIncreased;
            UIData.renderTeamScores(game, true);
        }
        
        // timer
        HelperFunctions.sendUI(game, {
            id: "timer",
            position: [40,7.5,20,4],
            components: [
                { type: "text", position: [0, 0, 100, 100], value: HelperFunctions.toTimer(), color: "gray"}
            ]
        });

        // check if any endgame condition matches
        game.custom.timeout = HelperFunctions.timeExceeded(game.custom.startedStep, GAME_OPTIONS.duration * 60);
        let test = new Set(WeightCalculator.getTopPlayers(game, true).map(e => e.team));
        game.custom.oneTeamLeft = test.size < 2;
        if (game.custom.oneTeamLeft) game.custom.winner = [...test][0];
        if (game.custom.oneTeamLeft || game.custom.timeout || Math.max(...control_point_data.scores, control_point_data.ghostScore) >= GAME_OPTIONS.points) this.tick = endGame; 
    }

    if ((game.step - game.custom.startedStep) % (GAME_OPTIONS.alienSpawns.interval * 60) === 0) {
        let alienSpec = GAME_OPTIONS.alienSpawns;
        while (game.aliens.length < alienSpec.capacity) game.addAlien({
            ...HelperFunctions.randomItem(AlienSpawns).value, //x, y
            level: HelperFunctions.randIntInRange(alienSpec.level.min, alienSpec.level.max + 1),
            crystal_drop: HelperFunctions.randIntInRange(alienSpec.crystals.min, alienSpec.crystals.max + 1),
            weapon_drop: HelperFunctions.randomItem(alienSpec.collectibles).value,
            code: HelperFunctions.randomItem(alienSpec.codes).value
        })
    }
}

const endGame = function (game) {
    // declare the winner and set gameover timeout
    // game.custom.timeout --> timer ended
    // game.custom.winner --> winner id, either team id or "ghost"
    // game.custom.oneTeamLeft --> only one team left
    let message = "";
    switch (true) {
        case game.custom.timeout: message = "Time's Out!"; break;
        case game.custom.oneTeamLeft: message = "All players in other teams left!"; break;
        default: message = `One team reaches ${GAME_OPTIONS.points} points!`
    }
    if (!game.custom.oneTeamLeft) {
        let maxScore = Math.max(...control_point_data.scores, control_point_data.ghostScore);
        let index = control_point_data.scores.indexOf(maxScore);
        if (index < 0) index = "Ghost";
        game.custom.winner = index;
    }
    let winnerData = TeamManager.getDataFromID(game.custom.winner);
    HelperFunctions.sendUI(game, {
        id: "endgame_notification",
        position: [25, 20, 50, 10],
        components: [
            { type: "text", position: [0, 0, 100, 50], value: message, color: "#cde"},
            { type: "text", position: [0, 50, 50, 50], value: winnerData.name.toUpperCase(), color: HelperFunctions.toHSLA(winnerData.hue, 1, 100, UIData.colorTextLightness), align: "right"},
            { type: "text", position: [50, 50, 50, 50], value: " wins!", color: "#cde", align: "left"}
        ]
    });
    game.custom.endGameInfo = {
        "Status": message,
        "Winner team": winnerData.name.toUpperCase(),
        " ": " ",
        "Your team": "Unknown",
        "Your kills": 0,
        "Your deaths": 0
    };

    let MVP = WeightCalculator.getTopPlayers(game)[0];
    if (MVP != null && (MVP.custom.kills || MVP.custom.deaths)) Object.assign(game.custom.endGameInfo, {
        "  ": " ",
        "MVP in this match:": MVP.name,
        "- Team": TeamManager.getDataFromShip(MVP).name.toUpperCase(),
        "- Kills": (+MVP.custom.kills || 0).toString(),
        "- Deaths": (+MVP.custom.deaths || 0).toString()
    });

    HelperFunctions.sendUI(game, {
        id: "timer",
        position: [40,7.5,20,4],
        components: [
            { type: "text", position: [0, 0, 100, 100], value: "MATCH FINISHED!", color: "yellow"}
        ]
    });
    for (let ship of game.ships) {
        ship.custom.endGameTick = game.step;
    }
    this.tick = im_here_just_to_kick_every_players_out_of_the_game;
}

const im_here_just_to_kick_every_players_out_of_the_game = function (game) {
    alwaysTick(game);
    // yes kick everyone
    for (let ship of game.ships) {
        if (!ship.custom.kicked && (ship.custom.endGameTick == null || game.step - ship.custom.endGameTick > 5 * 60)) {
            let endInfo = HelperFunctions.clone(game.custom.endGameInfo);
            endInfo["Your team"] = TeamManager.getDataFromShip(ship).name.toUpperCase();
            endInfo["Your kills"] = (+ship.custom.kills || 0).toString();
            endInfo["Your deaths"] = (+ship.custom.deaths || 0).toString();
            ship.gameover(endInfo);
            ship.custom.kicked = true;
            ship.custom.abilitySystemDisabled = true;
        }
    }
}



if (DEBUG) {
    const debug = { ...this };
    debug.tick = initialization;
    this.tick = function (game) {
        try { debug.tick(game); } catch (e) { console.error(e) }
    }
}
else this.tick = initialization;



/* Imported from misc/eventFunction.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

this.event = function (event, game) {
    AbilityManager.globalEvent(event, game);
    let ship = event.ship;
    if (ship == null || ship.id == null || ship.custom.kicked) return;
    switch (event.name) {
        case "ship_spawned":
            TeamManager.set(ship, void 0, false, true);
            AbilityManager.restore(ship);
            HelperFunctions.resetIntrusionWarningMSG(ship);
            UIData.updateScoreboard(game);
            ship.custom.chooseTimes = {};
            if (game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled) UIData.shipUIs.toggle(ship, false, true);
            break;
        case "ship_destroyed":
            HelperFunctions.resetIntrusionWarningMSG(ship);
            ship.custom.deaths = (ship.custom.deaths + 1) || 1;
            let killer = event.killer;
            if (killer != null && killer.id != null && !killer.custom.kicked) {
                killer.custom.kills = (killer.custom.kills + 1) || 1;
            }
            UIData.updateScoreboard(game);
            break;
        case "ui_component_clicked":
            if (UIData.blockers.has(event.id)) break;
            if (ship.custom.lastClickedStep != null && game.step - ship.custom.lastClickedStep < GAME_OPTIONS.buttons_cooldown * 60) break;
            ship.custom.lastClickedStep = game.step;
            let component = event.id;
            switch (component) {
                case UIData.shipUIs.toggleID:
                    UIData.shipUIs.toggle(ship);
                    break;
                case "next_ship": if (HelperFunctions.canUseButtons(ship)) {
                    let ships_list = AbilityManager.getAssignableShipsList(ship);
                    let pos = ships_list.indexOf(ship.custom.shipName) + 1;
                    UIData.assign(ship, ships_list[pos] || ships_list[0]);
                    break;
                }
                case "prev_ship": if (HelperFunctions.canUseButtons(ship)) {
                    let ships_list = AbilityManager.getAssignableShipsList(ship);
                    let pos = ships_list.lastIndexOf(ship.custom.shipName) - 1;
                    UIData.assign(ship, ships_list.at(pos));
                    break;
                }
                default:
                    if (HelperFunctions.canUseButtons(ship) && component.startsWith(UIData.shipUIs.shipSelectPrefix)) {
                        let shipName = component.replace(UIData.shipUIs.shipSelectPrefix, "");
                        if (shipName !== ship.custom.shipName) UIData.assign(ship, shipName);
                    }
            }
            break;
    }
}





/* Imported from misc/gameOptions.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

const vocabulary = [
    { text: "Heal", icon:"\u0038", key:"H" }, // heal my pods?
    { text: "Me", icon:"\u004f", key:"E" },
    { text: "Point", icon:"\u002a", key:"B" },
    { text: "Regroup", icon:"\u0031", key:"T" },
    { text: "Wait", icon:"\u0048", key:"W" },
    { text: "Yes", icon:"\u004c", key:"Y" },
    { text: "No", icon:"\u004d", key:"N" },
    { text: "Sorry", icon:"\u00a1", key:"S" },
    { text: "Attack", icon:"\u0049", key:"A" },
    { text: "Follow Me", icon:"\u0050", key:"F" },
    { text: "Good Game", icon:"\u00a3", key:"G" },
    { text: "Bruh", icon:"\u{1F480}", key:"I" },
    { text: "Ability", icon:"\u0028", key:"J" },
    { text: "Hmm???", icon:"\u004b", key:"Q" },
    //{ text: "No Problem", icon:"\u0047", key:"P" },
    { text: "Defend", icon:"\u0025", key:"D" },
    { text: " ", icon:"\u{1F913}", key:"L" }
];

this.options = {
    reset_tree: true,
    map_name,
    max_level: 1,
    starting_ship: 800,
    vocabulary,
    speed_mod: 1.2,
    radar_zoom: GAME_OPTIONS.radar_zoom,
    weapons_store: false,
    crystal_value: 0,
    crystal_drop: GAME_OPTIONS.crystal_drop,
    asteroids_strength: 2,
    soundtrack: "crystals.mp3", //civilisation.mp3 | procedurality.mp3 | argon.mp3 | crystals.mp3
    healing_ratio: GAME_OPTIONS.healing_ratio, // better to set the ability ship's damage rather than setting this option
    mines_self_destroy: true,
    mines_destroy_delay: 5000,
    map_size: GAME_OPTIONS.map_size,
    release_crystal: true,
    ships: [
        HelperFunctions.randInt(GAME_OPTIONS.x) ? '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}' : '{"name":"__Arena_Mod_Icon__","designer":"Supernova","level":1,"model":1,"size":1,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":90,"speed":[100,120],"rotation":[50,70],"acceleration":[100,130]}},"bodies":{"ring":{"section_segments":100,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[80,100,100,100,100,100,100,80],"height":[80,100,100,100,100,100,100,80],"texture":63,"propeller":false,"vertical":true},"spike1":{"section_segments":4,"offset":{"x":-73,"y":-65,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,0,20,50],"z":[0,0,0]},"width":[0,20,20,0],"height":[0,10,10,0],"texture":[1],"angle":46,"propeller":false},"spike2":{"section_segments":4,"offset":{"x":-57,"y":53,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,0,20,50],"z":[0,0,0]},"width":[0,20,20,0],"height":[0,10,10,0],"texture":[1],"angle":-46,"propeller":false},"x_1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":0},"position":{"x":[-18,-18,18,18],"y":[-20,-20,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[1]},"x_2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":0},"position":{"x":[18,18,-18,-18],"y":[-20,-20,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[1]}},"typespec":{"name":"__Arena_Mod_Icon__","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":90,"speed":[100,120],"rotation":[50,70],"acceleration":[100,130]}},"shape":[2,2,2,2,2,2.093,2.481,2.555,2.227,2,2,2,2,2,2,2,2,2.164,2.545,2.557,2.162,2,2,2,2,2,2,2,2,2,2.162,2.557,2.545,2.164,2,2,2,2,2,2,2,2,2.227,2.555,2.481,2.093,2,2,2,2],"lasers":[],"radius":2.557}}',
        ...AbilityManager.getShipCodes()
    ]
}

let ship101 = JSON.parse(this.options.ships[0]);

for (let val of [ship101, ship101.typespec]) {
    val.specs.generator = {
        capacity: [1e-300, 1e-300],
        reload: [1e-300, 1e-300]
    }
    val.specs.ship = {
        mass: 1,
        acceleration: [1e-300, 1e-300],
        speed: [1e-300, 1e-300],
        rotation: [1e-300, 1e-300]
    }
}

ship101.typespec.lasers = [];

this.options.ships[0] = JSON.stringify(ship101);





/* Imported from misc/gameInfo.js at Sun Jun 25 2023 23:04:25 GMT+0900 (Japan Standard Time) */

AbilityManager.echo(`[[bg;DarkTurquoise;]Re:][[bg;#EE4B2B;]Arena] ([[;#AAFF00;]${__ABILITY_SYSTEM_INFO__.branch}]) [[;Cyan;]v${__ABILITY_SYSTEM_INFO__.version} (Build ID [[;${HelperFunctions.toHSLA(__ABILITY_SYSTEM_INFO__.buildID)};]${__ABILITY_SYSTEM_INFO__.buildID}])\nMap picked: [[b;Cyan;]${MapManager.get().name} by ${MapManager.get().author}\n\nType \`commands\` to see all commands\nAnd \`usage <commandName>\` to show usage of a command\n\n]`);