# Rorymon overworld prototype

Open `http://127.0.0.1:4173/demo/overworld/` while the Rorymon demo server is running.

Use WASD or the arrow keys to move north, west, east, or south. Hold Shift to run. Movement is restricted to one cardinal axis at a time. The player uses the approved eight-frame male ranger walking strips for all four directions.

The prototype includes a camera-following tile map, short and tall grass, trails, water, trees, rocks, a Rorymon Center, a Store, a carved story pole, collision boundaries, saved player position, and step-based random encounters in tall grass. An encounter can transition into a single-opponent wild battle. Returning from the battle restores the player's overworld position.

The current map and encounter rates are temporary tuning values. The procedural tiles can be replaced with the approved environment tile sheets without changing movement, collision, camera, or encounter logic.
