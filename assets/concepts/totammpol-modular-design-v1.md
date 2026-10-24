# Totammpöl modular design

Totammpöl is a single-stage Rorymon assembled from three carved animal modules. It has no evolutions.

## Modules

Each position has four interchangeable animal designs:

| Animal | Rorymon type | Visual cue |
| --- | --- | --- |
| Eagle | Flying | Hooked beak and wing-brow carving |
| Bear | Ice | Round ears and pale-blue icy muzzle |
| Moose | Leaf | Broad muzzle and branching antler carving |
| Goat | Rock | Curved horns and angular gray cheek carving |

The top animal supplies the primary type and the middle animal supplies the secondary type. The bottom animal does not change its type.

Each assembled Totammpöl must use three different animals. An animal cannot be repeated in another position, so eagle/bear/goat is valid while eagle/bear/bear is invalid. Choosing and ordering three of the four animals produces 24 valid assemblies. Because duplicate top and middle animals are forbidden, every Totammpöl has two different types.

## Collection and team building

Totammpöl's 24 assemblies are mechanically distinct collectibles rather than cosmetic variants. Trainers have a reason to find and raise multiple Totammpöls because the top position controls primary typing and early move access, the middle position controls secondary typing and the level-16 move branch, and the bottom position controls the level-24 environment. Two assemblies containing the same three animals can therefore have different matchups, development curves, and team roles solely because their order differs. Some combinations will naturally work better than others in particular teams or against particular opponents; this is an intended part of Totammpöl's identity.

## Level progression

Totammpöl begins with a small set of universal moves plus one elemental attack inherited from its top animal. At level 16, it learns its first elemental move inherited from its middle animal. At level 24, it learns a battlefield move inherited from its bottom animal. At later levels, it continues learning additional moves from both its top and middle animals. The bottom animal therefore affects strategy without adding a third type or supplying ordinary typed attacks.

| Position | Unlock | Function |
| --- | --- | --- |
| Universal | Starting levels | Basic neutral attack and a simple defensive or status move |
| Top animal | Starting levels and later milerocks | Early same-type elemental attack followed by additional attacks or utility moves |
| Middle animal | Level 16 and later milerocks | First secondary-type move followed by additional attacks or utility moves |
| Bottom animal | Level 24 | Animal-specific battle environment effect |

### Bottom-animal environment effects

At level 24, the bottom animal supplies one of four environment moves:

| Bottom animal | Environment | Intended interaction |
| --- | --- | --- |
| Eagle | Sandstorm | At the end of each turn, deals 1/16 maximum HP to Rorymon that are not Rock, Ground, or Steel type; increases the Special Defense of Rock types by 50% |
| Goat | Hail | At the end of each turn, deals 1/16 maximum HP to Rorymon that are not Ice type |
| Moose | Snow | Increases the Defense of Ice types by 50% and makes Blizzard more likely to hit |
| Bear | Strong Winds | Causes attacks normally super effective against Flying types to deal neutral damage to Flying types instead |

These follow the established Pokémon weather designs as the initial mechanical reference. In particular, Strong Winds neutralizes the Flying weaknesses represented by Electric, Ice, and Rock attacks when the Rorymon type chart gives them super-effective matchups. Hail and Snow remain separate environments: Hail causes recurring damage, while Snow provides the Ice Defense bonus. Weather immunity abilities and protective items can be added after Rorymon's ability and item systems are defined.

The bottom animal does not receive a direct same-type benefit from its own environment because it is not one of Totammpöl's active types. Its role is to support a compatible top or middle module or to apply general battlefield pressure. Hail is explicitly offensive: it damages the opponent but can also damage Totammpöl when Bear/Ice is absent from the upper two positions. Snow is explicitly defensive: a bottom Moose gains nothing from Snow by itself, but Snow gives the 50% Defense bonus when Bear/Ice occupies the top or middle position. Sandstorm and Strong Winds follow the same indirect-support principle for Goat/Rock and Eagle/Flying modules respectively.

The exact later move levels and environment duration will be balanced with the wider combat system. A five-turn duration remains the initial target.

## Art assembly

The production set contains twelve transparent sprites: four top figures, four middle figures, and four bottom figures. Every module includes a complete, clearly visible animal head; middle and bottom pieces must never be reduced to abstract body patterns or feet. Signature anatomy remains visible in every position, including antlers on every moose module. Every module uses the same canvas size, centerline, trunk width, and flat horizontal connection seams. The no-duplicate rule permits 24 valid visual assemblies from the twelve source parts.

Suggested filenames follow `totammpol-{position}-{animal}.png`, such as `totammpol-top-eagle.png` and `totammpol-bottom-goat.png`.

