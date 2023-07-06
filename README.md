# Re:Arena
Remake of Arena Mod (aka Arena Mod Recontinuation)

## What's this?
This is the remake of Arena Mod, after development was stopped by the original developers.

However, to make the mod more customizable and organized, I remade this mod with the help from the community.

This remake is only in the early stages, so do prepare for tons of hidden bugs, which I may ~~or may not~~ detect and fix in the future.

But at least it should run as expected ~~I guess~~

## Credits

### Original Arena Mod (v1.0 - v3.1.2)
* **CEO:** Nexagon
* **Coding:** Nexagon
* **Textures:** Nexagon, and others
* **Ships:** Nexagon, Edward, Supernova, and others
* **Maps:** Nexagon, Carme, Caramel, Nerd69420, and others
* **Contributors:** Lexydrow, Boris, Thuliux, Bylolopro, Caramel, Duschi, Edward, Megalodon, Supernova, ThirdToeMan, Madness, Slayer, and others

### Re:Arena - Arena Mod Remake/Recontinuation (v3.1.3 - v4.0+)
* **CEO:** Tost
* **Coding:** Bhpsngum
* **Textures:** Caramel
* **Ships:** Caramel
* **Maps:** Supernova, Caramel, Bylolopro, Nerd69420, Megalodon, and others
* **Contributors:** Tost, Caramel, Lexydrow, Akira, and others

## What's in here?
**Folders:**
* **`files`**: Contains basically disassembled parts of the mod
* **`resources`**: Contains mod textures and resources
* **`README.md`**: This file
* **`mergeFiles.js`**: This file is used to assemble the codes to create a complete mod file, only run in NodeJS
* **`releases`**: Contains compiled versions of the mod:
    * **{Name}_{Version}_Main.js**: The code that you can host as a normal Arena game, supports commands.
    * **{Name}_{Version}_MS.js**: Prepared code for future Modding Space release. Don't use this one unless you actually want to.
    * **{Name}_{Version}_Battlefield.js**: Code for Re:Arena Battlefield events.
    * **{Name}_{Version}_ShipTesting.js**: Purely a Ability Ships Tester code, use this to test your newly added ships.

## Q&A
If you have any questions or feedbacks, please open an issue and I might include answers in this section.

### Discord server invite link?
https://discord.gg/697sdMJwKj

### Why so many files and not a single file?
Welp, actually at first, the remade was conducted only on a single file as usual, but when it reached 5k+ lines, i had some problems with it:
* Navigating between parts of codes takes a long while and it's inconvenient
* This remake is intended for everyone to be able to edit the ship abilities and some other configurations. Editing on 5k+ lines is actually a true pain
* Creating different versions with it and updating them at the same time takes too many braincells (even more than the only braincell i have)
* I hate putting everything on just a single file (based developer moment)

To deal with it, at first I decided to load files like how libraries and packages works on NodeJS. BUT, since I was also publishing mods to MS before, there was a time I did tried loading Rumble maps like that, and Gilles said:

> "Please include everything in a single file"

So, the library-loading way surely doesn't work

But then, I had a look over Starblast Prototypes (SP) by UranusOrbiter (It's actually insane, you guys should [check it as well](https://github.com/Bhpsngum/Uranus-Starblast-Prototypes)). What he did to deal with the files was to create a "taper" to assemble code parts into a single file.

Yep, that works.

But uh, I can't just yoink the "taper" code from him because SP is not AMR and vice versa. So I created a custom "taper" by myself.

And based on that, I made mod templates, which are basically "Ability System" but can be used to create mods on your preferences. You can take a look [here](/files/templates/).