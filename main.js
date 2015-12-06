var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MagicArray = (function (_super) {
    __extends(MagicArray, _super);
    function MagicArray(contents) {
        if (contents === void 0) { contents = undefined; }
        _super.call(this);
        if (contents) {
            for (var _i = 0; _i < contents.length; _i++) {
                var a = contents[_i];
                this.push(a);
            }
        }
    }
    /**
      Returns a new array with all o removed.
    */
    MagicArray.prototype.remove = function (o) {
        var result = new MagicArray();
        for (var i = 0; i < this.length; i++) {
            if (this[i] !== o) {
                result.push(this[i]);
            }
        }
        return result;
    };
    MagicArray.prototype.each = function (fn) {
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var a = _a[_i];
            fn(a);
        }
    };
    MagicArray.prototype.find = function (key) {
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var a = _a[_i];
            if (key(a))
                return a;
        }
        return null;
    };
    MagicArray.prototype.clear = function () {
        return new MagicArray();
    };
    MagicArray.prototype.filter = function (fn) {
        var result = new MagicArray();
        for (var i = 0; i < this.length; i++) {
            var val = this[i];
            if (fn(val)) {
                result.push(val);
            }
        }
        return result;
    };
    MagicArray.prototype.map = function (fn) {
        var result = new MagicArray();
        for (var i = 0; i < this.length; i++) {
            result.push(fn(this[i]));
        }
        return result;
    };
    /**
     * Sorts by provided key. Returns newly sorted array.
     */
    MagicArray.prototype.sortByKey = function (key) {
        var result = this
            .slice()
            .sort(function (a, b) { return key(a) - key(b); });
        return new MagicArray(result);
    };
    MagicArray.prototype.arr = function () {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(this[i]);
        }
        return result;
    };
    return MagicArray;
})(Array);
// TODO - maybe look into immutable.js for how they hash js objects, generally speaking.
var MagicDict = (function () {
    function MagicDict(defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        this._map = {};
        this._defaultValue = null;
        this._defaultValue = defaultValue;
    }
    MagicDict.prototype.getHashCode = function (obj) {
        /*
          The following things in JavaScript are not objects:
    
          * Strings
          * Numbers
          * Booleans
          * null
          * undefined
        */
        var type = typeof obj;
        if (type === "string" ||
            type === "number" ||
            type === "boolean" ||
            type === "null" ||
            type == "undefined") {
            return obj;
        }
        if (!obj.__hashcode) {
            Object.defineProperty(obj, '__hashcode', {
                value: "" + Math.random(),
                enumerable: false
            });
        }
        return obj.__hashcode;
    };
    MagicDict.prototype.put = function (key, value) {
        var hash = this.getHashCode(key);
        if (this._map[hash] !== undefined && this._map[hash] !== value) {
            console.error("Uh oh, hashing issues.");
        }
        this._map[this.getHashCode(key)] = value;
        return value;
    };
    MagicDict.prototype.get = function (key) {
        if (this._defaultValue !== null && !this.contains(key)) {
            return this.put(key, this._defaultValue());
        }
        return this._map[this.getHashCode(key)];
    };
    MagicDict.prototype.contains = function (key) {
        return this._map[this.getHashCode(key)] !== undefined;
    };
    MagicDict.prototype.remove = function (key) {
        var hash = this.getHashCode(key);
        if (this.contains(key)) {
            delete this._map[hash];
        }
        else {
            console.error(key, " not found in MagicDict#remove");
        }
    };
    return MagicDict;
})();
/// <reference path="./datastructures.d.ts"/>
var Sprite = (function () {
    function Sprite(components, texture) {
        if (components === void 0) { components = []; }
        if (texture === void 0) { texture = null; }
        this.events = new Events();
        /**
          Whether this Sprite will show up in the Inspector.
        */
        this.inspectable = true;
        var className = Util.GetClassName(this);
        if (!this.baseName)
            this.baseName = Util.GetClassName(this);
        this._objectNumber = Sprite._derivedObjectCount[className] = (Sprite._derivedObjectCount[className] || 0) + 1;
        if (texture instanceof PIXI.Texture) {
            this.texture = texture;
        }
        else if (typeof texture === "string") {
            this.texture = PIXI.Texture.fromImage(texture);
        }
        else if (texture === null) {
            this.texture = PIXI.Texture.EMPTY;
        }
        this.displayObject = new PIXI.Sprite(this.texture);
        Stage.doToSprite.put(this.displayObject, this);
        this.x = 0;
        this.y = 0;
        var _graphics = this.displayObject.addChild(new PIXI.Graphics());
        this.displayObject.interactive = true;
        _graphics.interactive = true;
        this.initComponents(components.concat([
            new DebugDraw(this, _graphics)
        ]));
    }
    Object.defineProperty(Sprite.prototype, "name", {
        /**
          Name for this sprite. Only used for debugging.
        */
        get: function () { return this.baseName + " (" + this._objectNumber + ")"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "textureUrl", {
        get: function () {
            return this.texture.baseTexture.imageUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "inspectableProperties", {
        get: function () {
            var className = Util.GetClassName(this);
            Sprite.inspectableProperties[className] = Sprite.inspectableProperties[className] || Sprite.defaultInspectableProperties.slice(0);
            return Sprite.inspectableProperties[className];
        },
        enumerable: true,
        configurable: true
    });
    Sprite.prototype.addInspectableProperty = function (className, propName) {
        Sprite.inspectableProperties[className] = Sprite.inspectableProperties[className] || Sprite.defaultInspectableProperties.slice(0);
        Sprite.inspectableProperties[className].push(propName);
    };
    Object.defineProperty(Sprite.prototype, "z", {
        /**
          * Z-ordering. Higher numbers are on top of lower numbers.
          */
        get: function () { return this._z; },
        set: function (val) {
            this._z = val;
            if (this.parent) {
                this.parent.sortDepths();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "x", {
        get: function () { return this.displayObject.position.x; },
        set: function (val) { this.displayObject.position.x = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "y", {
        get: function () { return this.displayObject.y; },
        set: function (val) { this.displayObject.y = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "parent", {
        get: function () {
            if (this.displayObject.parent) {
                return Stage.doToSprite.get(this.displayObject.parent);
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "stage", {
        get: function () {
            var sprite = this;
            // If we keep going up, we'll either hit the Stage, or we're an orphaned 
            // Sprite. 
            while (sprite.parent != null) {
                sprite = sprite.parent;
            }
            if (sprite instanceof Stage) {
                return sprite;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "position", {
        /**
          Position of this sprite relative to its parent.
        */
        get: function () {
            return new Point(this.displayObject.position.x, this.displayObject.position.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "absolutePosition", {
        /**
          Position of this sprite relative to the world.
        */
        get: function () {
            if (this.parent == null) {
                return this.position;
            }
            var result = this.position.add(this.parent.absolutePosition);
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "width", {
        get: function () { return this.displayObject.width; },
        set: function (val) { this.displayObject.width = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "height", {
        get: function () { return this.displayObject.height; },
        set: function (val) { this.displayObject.height = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "rotation", {
        get: function () { return this.displayObject.rotation; },
        set: function (val) { this.displayObject.rotation = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "alpha", {
        get: function () { return this.displayObject.alpha; },
        set: function (val) { this.displayObject.alpha = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "visible", {
        get: function () { return this.displayObject.visible; },
        set: function (val) { this.displayObject.visible = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "bounds", {
        get: function () { return this.displayObject.getBounds(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "children", {
        get: function () {
            return new MagicArray(this.displayObject.children)
                .filter(function (d) { return Stage.doToSprite.contains(d); })
                .map(function (d) { return Stage.doToSprite.get(d); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "totalNumSubChildren", {
        get: function () {
            return 1 + Util.Sum(this.children.map(function (o) { return o.totalNumSubChildren; }));
        },
        enumerable: true,
        configurable: true
    });
    Sprite.prototype.initComponents = function (components) {
        for (var _i = 0; _i < components.length; _i++) {
            var c = components[_i];
            // Make easy-to-access references to common components.
            if (c instanceof PhysicsComponent)
                this.physics = c;
            if (c instanceof DebugDraw)
                this.debug = c;
            c.init(this);
        }
        this.components = components;
    };
    Sprite.prototype.sortDepths = function () {
        this.displayObject.children.sort(function (a, b) {
            /*
              Our children are either other Sprites, or PIXI.Graphics.
              PIXI.Graphics won't have a z index, so we just put them as high as
              possible.
            */
            var spriteForA = Stage.doToSprite.get(a);
            var spriteForB = Stage.doToSprite.get(b);
            var aZ = spriteForA ? spriteForA.z : Number.POSITIVE_INFINITY;
            var bZ = spriteForB ? spriteForB.z : Number.POSITIVE_INFINITY;
            return aZ - bZ;
        });
    };
    Sprite.prototype.addChild = function (child) {
        this.displayObject.addChild(child.displayObject);
        this.sortDepths();
        this.events.emit(SpriteEvents.AddChild, child);
        child.events.emit(SpriteEvents.ChangeParent, this);
        return child;
    };
    Sprite.prototype.removeChild = function (child) {
        this.displayObject.removeChild(child.displayObject);
    };
    Sprite.prototype.clone = function () {
        var newSprite = new Sprite([], this.texture);
        return newSprite;
    };
    Sprite.prototype.update = function () {
    };
    /**
     * Get every sprite that is nested under this sprite.
     */
    Sprite.prototype.getAllSprites = function () {
        var result = new MagicArray();
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            for (var _b = 0, _c = this.getAllSpritesHelper(child); _b < _c.length; _b++) {
                var sub = _c[_b];
                result.push(sub);
            }
        }
        return result;
    };
    Sprite.prototype.getAllSpritesHelper = function (root) {
        var result = new MagicArray();
        result.push(root);
        for (var _i = 0, _a = root.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var innerSprites = this.getAllSpritesHelper(child);
            for (var _b = 0; _b < innerSprites.length; _b++) {
                var inner = innerSprites[_b];
                result.push(inner);
            }
        }
        return result;
    };
    Sprite.prototype.findTopmostSpriteAt = function (point, interactable) {
        var sprites = this.getAllSprites();
        return sprites.find(function (o) {
            if (interactable && !o.inspectable)
                return;
            return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
                point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
        });
    };
    /**
     * This just maps sprite names to number of that type of sprite that we have
     * seen. Only really used for _derivedObjectCount.
     */
    Sprite._derivedObjectCount = {};
    Sprite.defaultInspectableProperties = ["x", "y", "width", "height", "rotation", "alpha"];
    Sprite.inspectableProperties = {};
    /**
     * In the case where Sprites are created before the Stage is created, we enqueue them here
     * so we can add them to the Stage when it is finally created.
     */
    Sprite.enqueuedSprites = new MagicArray();
    return Sprite;
})();
/// <reference path="Sprite.ts"/>
var TiledMapParser = (function (_super) {
    __extends(TiledMapParser, _super);
    function TiledMapParser(path) {
        var _this = this;
        _super.call(this);
        this._rootPath = path.slice(0, path.lastIndexOf("/") + 1);
        var request = new XMLHttpRequest();
        request.open('GET', path + "?" + Math.random(), true); // Cachebust the path to the map.
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var data = JSON.parse(request.responseText);
                _this.process(data);
            }
            else {
                _this.error("Error retrieving map.");
            }
        };
        request.onerror = function () {
            _this.error("Error retrieving map.");
        };
        request.send();
    }
    TiledMapParser.prototype.error = function (msg) {
        console.error(msg);
    };
    TiledMapParser.prototype.process = function (json) {
        var tilesets = new MagicArray();
        var tilesetsJSON = new MagicArray(json.tilesets)
            .sortByKey(function (o) { return o.firstgid; });
        for (var i = 0; i < tilesetsJSON.length; i++) {
            var currentTileset = tilesetsJSON[i];
            var nextTileset = tilesetsJSON[i + 1];
            var textureUrl = this._rootPath + currentTileset.image;
            var texture = PIXI.Texture.fromImage(textureUrl);
            tilesets.push({
                texture: texture,
                tileWidth: currentTileset.tilewidth,
                tileHeight: currentTileset.tileheight,
                firstGID: currentTileset.firstgid,
                lastGID: i === tilesetsJSON.length - 1 ? Number.POSITIVE_INFINITY : nextTileset.firstgid,
                widthInTiles: currentTileset.imagewidth / currentTileset.tilewidth
            });
        }
        for (var _i = 0, _a = json.layers; _i < _a.length; _i++) {
            var layerJSON = _a[_i];
            var layer = new Sprite();
            layer.baseName = layerJSON.name;
            for (var i_1 = 0; i_1 < layerJSON.data.length; i_1++) {
                // Find the spritesheet that contains the tile id.
                var value = layerJSON.data[i_1];
                if (value == 0)
                    continue;
                var spritesheet = tilesets.find(function (o) { return o.firstGID <= value && o.lastGID > value; });
                value -= spritesheet.firstGID;
                var tileSourceX = (value % spritesheet.widthInTiles) * spritesheet.tileWidth;
                var tileSourceY = Math.floor(value / spritesheet.widthInTiles) * spritesheet.tileHeight;
                var destX = (i_1 % layerJSON.width) * spritesheet.tileWidth;
                var destY = Math.floor(i_1 / layerJSON.width) * spritesheet.tileHeight;
                var crop = new PIXI.Rectangle(tileSourceX, tileSourceY, spritesheet.tileWidth, spritesheet.tileHeight);
                // TODO - cache these textures.
                var texture = new PIXI.Texture(spritesheet.texture, crop);
                var tile = new Sprite([], texture);
                layer.addChild(tile);
                tile.x = destX;
                tile.y = destY;
            }
            this.addChild(layer);
        }
    };
    return TiledMapParser;
})(Sprite);
var Game = (function () {
    function Game(width, height, element, debug) {
        var _this = this;
        if (debug === void 0) { debug = false; }
        this._width = width;
        this._height = height;
        this._renderer = PIXI.autoDetectRenderer(width, height);
        this.stage = new Stage(width, height, debug);
        Globals.initialize(this.stage);
        this.debug = new Debug();
        this.root = React.render(React.createElement(Root, {"stage": this.stage, "debug": debug}), element);
        this.stage.setRoot(this.root);
        var canvasContainer = React.findDOMNode(this.root).getElementsByClassName("content").item(0);
        canvasContainer.appendChild(this._renderer.view);
        this.stage.events.on(SpriteEvents.AddChild, function () { return _this.onAddChild(); });
        // Kick off the main game loop.
        requestAnimationFrame(function () { return _this.update(); });
    }
    Object.defineProperty(Game.prototype, "width", {
        get: function () { return this._width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "height", {
        get: function () { return this._height; },
        enumerable: true,
        configurable: true
    });
    /**
     * The core update loop.
    */
    Game.prototype.update = function () {
        var children = this.stage.children;
        children.push(this.stage);
        for (var _i = 0; _i < children.length; _i++) {
            var sprite = children[_i];
            for (var _a = 0, _b = sprite.components; _a < _b.length; _a++) {
                var c = _b[_a];
                c.preUpdate();
            }
        }
        for (var _c = 0; _c < children.length; _c++) {
            var sprite = children[_c];
            sprite.update();
            for (var _d = 0, _e = sprite.components; _d < _e.length; _d++) {
                var c = _e[_d];
                c.update();
            }
        }
        for (var _f = 0; _f < children.length; _f++) {
            var sprite = children[_f];
            for (var _g = 0, _h = sprite.components; _g < _h.length; _g++) {
                var c = _h[_g];
                c.postUpdate();
            }
        }
        Globals.physicsManager.update();
        this._renderer.render(this.stage.displayObject);
        requestAnimationFrame(this.update.bind(this));
    };
    Game.prototype.onAddChild = function () {
        var _this = this;
        setTimeout(function () { return _this.root.forceUpdate(); }, 0);
    };
    return Game;
})();
function inspect(target, name) {
    target.addInspectableProperty(Util.GetClassName(target), name);
}
var Util = (function () {
    function Util() {
    }
    Util.RunOnStart = function (func) {
        if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
            setTimeout(func); // setTimeout to allow the rest of the script to load.
        }
        else {
            document.addEventListener("DOMContentLoaded", function () {
                func();
            });
        }
    };
    Util.ArrayEq = function (a, b) {
        if (a.length != b.length)
            return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    };
    Util.Sum = function (a) {
        var result = 0;
        for (var i = 0; i < a.length; i++) {
            result += a[i];
        }
        return result;
    };
    /**
     * Returns the point of intersection, or null if there wasn't one.
     *
     * @param ray1
     * @param ray2
     * @returns {}
     */
    Util.RayRayIntersection = function (ray0, ray1) {
        var p0_x = ray0.x0;
        var p0_y = ray0.y0;
        var p1_x = ray0.x1;
        var p1_y = ray0.y1;
        var p2_x = ray1.x0;
        var p2_y = ray1.y0;
        var p3_x = ray1.x1;
        var p3_y = ray1.y1;
        var s1_x = p1_x - p0_x;
        var s1_y = p1_y - p0_y;
        var s2_x = p3_x - p2_x;
        var s2_y = p3_y - p2_y;
        var s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        var t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return new Maybe(new Point(p0_x + (t * s1_x), p0_y + (t * s1_y)));
        }
        return new Maybe();
    };
    /**
     * Returns whether the given point is inside the given rect.
     * @param rect
     * @param point
     * @returns {}
     */
    Util.RectPointIntersection = function (rect, point) {
        return rect.x >= point.x && rect.x + rect.width <= point.x &&
            rect.y >= point.y && rect.y + rect.height <= point.y;
    };
    /**
     * Returns the point of collision of a ray and a rectangle that is closest
     * to the start of the ray, if there is one.
     * @param ray
     * @param rect
     * @returns {}
     */
    Util.RayRectIntersection = function (ray, rect) {
        var lines = [
            new Ray(rect.x, rect.y, rect.x + rect.width, rect.y),
            new Ray(rect.x, rect.y, rect.x, rect.y + rect.height),
            new Ray(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height),
            new Ray(rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height)
        ];
        var closest = undefined;
        for (var _i = 0; _i < lines.length; _i++) {
            var rectLine = lines[_i];
            Util.RayRayIntersection(ray, rectLine).then(function (intersection) {
                if (closest == null || intersection.distance(ray.start) < closest.distance(ray.start)) {
                    closest = intersection;
                }
            });
        }
        return new Maybe(closest);
    };
    Util.GetClassName = function (target) {
        if (target == null) {
            return "[null]";
        }
        if (target == undefined) {
            return "[undefined]";
        }
        // You can do something like Object.create(null) and make an object
        // with no constructor. Weird.
        if (!target.constructor) {
            return "[object]";
        }
        var constructor = ("" + target.constructor);
        if (constructor.indexOf("function ") !== -1) {
            return ("" + target.constructor).split("function ")[1].split("(")[0];
        }
        else {
            return "[stubborn builtin]";
        }
    };
    Util.StartsWith = function (str, prefix) {
        return str.lastIndexOf(prefix, 0) === 0;
    };
    Util.Contains = function (str, inner) {
        return str.toUpperCase().indexOf(inner.toUpperCase()) !== -1;
    };
    return Util;
})();
/**
 * Adds console.watch to watch variables and hit breakpoints on changes
 * (handy for hunting down hard to find bugs!)
 */
console.watch = function (oObj, sProp) {
    var sPrivateProp = "$_" + sProp + "_$"; // to minimize the name clash risk
    oObj[sPrivateProp] = oObj[sProp];
    // overwrite with accessor
    Object.defineProperty(oObj, sProp, {
        get: function () {
            return oObj[sPrivateProp];
        },
        set: function (value) {
            //console.log("setting " + sProp + " to " + value);
            debugger; // sets breakpoint
            oObj[sPrivateProp] = value;
        }
    });
};
/// <reference path="lib/lib.d.ts"/>
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// TODO: parse map json (better than phaser -_-)
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = this;
        _super.call(this, [
            new PhysicsComponent({
                solid: true,
                immovable: true
            })
        ], "assets/img.png");
        this.baseName = "Player";
        this.speed = 5;
        this.tint = 0xff0000;
        this.start = new Point(0, 0);
        Globals.mouse.events.on(MouseEvents.MouseDown, function (p) {
            _this.start = p;
        });
        // this.width = 15;
        // this.height = 15;
    }
    Player.prototype.update = function () {
        var dx = 0;
        var dy = 0;
        if (Globals.keyboard.down.D) {
            dx += this.speed;
        }
        if (Globals.keyboard.down.A) {
            dx -= this.speed;
        }
        if (Globals.keyboard.down.W) {
            dy -= this.speed;
        }
        if (Globals.keyboard.down.S) {
            dy += this.speed;
        }
        this.physics.moveBy(dx, dy);
        /*
        Raycast debugging stuff.
        */
        var d = Globals.stage.debug;
        var l = new Ray(this.start.x, this.start.y, Globals.mouse.position.x, Globals.mouse.position.y);
        d.draw(l);
        var c = Globals.physicsManager.raycast(l).then(function (res) {
            d.draw(res.position);
            d.draw(res.sprite.bounds);
        });
    };
    __decorate([
        inspect, 
        __metadata('design:type', Number)
    ], Player.prototype, "speed");
    __decorate([
        inspect, 
        __metadata('design:type', Number)
    ], Player.prototype, "tint");
    return Player;
})(Sprite);
var Box = (function (_super) {
    __extends(Box, _super);
    function Box() {
        _super.call(this, [
            new PhysicsComponent({
                solid: true,
                immovable: true
            })
        ], "assets/img.png");
    }
    return Box;
})(Sprite);
var MyGame = (function (_super) {
    __extends(MyGame, _super);
    function MyGame() {
        _super.call(this, 600, 400, document.getElementById("main"), true);
        var player = new Player();
        player.x = 100;
        player.y = 100;
        player.z = 10;
        Globals.stage.addChild(player);
        var box = new Box();
        box.x = 200;
        box.y = 200;
        box.z = 10;
        Globals.stage.addChild(box);
        var tmp = new TiledMapParser("assets/map.json");
        tmp.z = -10;
        Globals.stage.addChild(tmp);
    }
    return MyGame;
})(Game);
Util.RunOnStart(function () {
    Debug.DEBUG_MODE = false;
    new MyGame();
});
var Component = (function () {
    function Component() {
    }
    Component.prototype.init = function (sprite) {
        this._sprite = sprite;
    };
    return Component;
})();
var Group = (function () {
    function Group() {
        this.dict = new MagicDict();
    }
    Group.prototype.add = function (member) {
        this.dict.put(member, true);
    };
    Group.prototype.remove = function (member) {
        this.dict.remove(member);
    };
    Group.prototype.contains = function (member) {
        return this.dict.contains(member);
    };
    return Group;
})();
/**
  Maybe type in the spirit of Haskell to indicate nullable types. It doesn't have all the Monadic coolness of Haskell,
  but it indicates nullable types pretty well.
*/
var Maybe = (function () {
    function Maybe(value) {
        if (value === void 0) { value = undefined; }
        this.hasValue = false;
        if (value === null) {
            console.error("Never do this.");
        }
        this.value = value;
    }
    Maybe.prototype.then = function (value, nothing) {
        if (nothing === void 0) { nothing = null; }
        if (this.hasValue) {
            value(this.value);
        }
        else if (nothing !== null) {
            nothing();
        }
    };
    Object.defineProperty(Maybe.prototype, "value", {
        get: function () {
            if (this.hasValue) {
                return this._value;
            }
            console.error("asked for value of Maybe without a value");
        },
        set: function (value) {
            if (value === null) {
                console.error("Never do this.");
            }
            this._value = value;
            this.hasValue = value !== undefined;
        },
        enumerable: true,
        configurable: true
    });
    return Maybe;
})();
/* PIXI.Polygon is good, but it does not allow us to get the points that we passed in ourselves
   (easily), which is just dumb. */
var Polygon = (function () {
    function Polygon(points) {
        this._pixiPolygon = new PIXI.Polygon(points);
    }
    Object.defineProperty(Polygon.prototype, "points", {
        get: function () {
            var result = [];
            for (var i = 0; i < this._pixiPolygon.points.length; i += 2) {
                result.push(new PIXI.Point(this._pixiPolygon.points[i], this._pixiPolygon.points[i + 1]));
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Polygon.prototype.contains = function (point) {
        return this._pixiPolygon.contains(point.x, point.y);
    };
    return Polygon;
})();
var DebugDraw = (function (_super) {
    __extends(DebugDraw, _super);
    function DebugDraw(_target, _graphics) {
        var _this = this;
        _super.call(this);
        this._target = _target;
        this._graphics = _graphics;
        this.events = new Events(true);
        this._clickableShapes = new MagicArray();
        /* Add mouse events, but listen to MetaEvents.AddFirstEvent so we
           aren't adding interactive events when there's no need to. */
        this.events.metaEvents.on(MetaEvents.AddFirstEvent, function () {
            var dObj = _this._target.displayObject;
            dObj.interactive = true;
            dObj.hitArea = new PIXI.Rectangle(-50, -50, 200, 200);
            dObj.on("mousedown", function (e) {
                var pos = e.data.getLocalPosition(dObj, e.data.global.clone());
                if (_this._areCoordsInBounds(pos)) {
                    _this.events.emit(SpriteEvents.MouseDown, pos);
                    e.stopPropagation();
                }
            });
            dObj.on("mouseup", function (e) {
                var pos = e.data.getLocalPosition(dObj, e.data.global.clone());
                _this.events.emit(SpriteEvents.MouseUp, pos);
                e.stopPropagation();
            });
        });
    }
    DebugDraw.prototype._areCoordsInBounds = function (point) {
        for (var _i = 0, _a = this._clickableShapes; _i < _a.length; _i++) {
            var polygon = _a[_i];
            if (polygon.contains(point)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Draw a line. Meant for debugging purposes only.
     */
    DebugDraw.prototype.drawLine = function (x0, y0, x1, y1, color, alpha) {
        if (color === void 0) { color = 0xffffff; }
        if (alpha === void 0) { alpha = 1; }
        this._graphics.lineStyle(1, color, alpha);
        this._graphics.moveTo(x0, y0);
        this._graphics.lineTo(x1, y1);
    };
    /**
     * Draw a point. Meant for debugging purposes only.
     */
    DebugDraw.prototype.drawPoint = function (x, y, color) {
        if (color === void 0) { color = 0xff0000; }
        this.drawLine(x, 0, x, this._target.stage.height, color);
        this.drawLine(0, y, this._target.stage.width, y, color);
    };
    /**
     * Draw a shape.
     */
    DebugDraw.prototype.drawShape = function (polygon, color) {
        if (color === void 0) { color = 0xffffff; }
        var lastPoint = polygon.points[polygon.points.length - 1];
        this._graphics.beginFill(color);
        this._graphics.lineColor = 0;
        this._graphics.moveTo(lastPoint.x, lastPoint.y);
        for (var _i = 0, _a = polygon.points; _i < _a.length; _i++) {
            var point = _a[_i];
            this._graphics.lineTo(point.x, point.y);
        }
        this._graphics.endFill();
        this._clickableShapes.push(polygon);
    };
    DebugDraw.prototype.drawRectangle = function (x0, y0, x1, y1) {
        var white = 0xffffff;
        var alpha = .2;
        var stageWidth = this._target.stage.width;
        var stageHeight = this._target.stage.height;
        /*
              (1)        (2)
              x0         x1
              |          |
              |          |
              |          |
       y0-----*----------*-------  (3)
              |          |
              |          |
              |          |
       y1-----*----------*-------  (4)
              |          |
              |          |
              |          |
    
        */
        // (1)
        this.drawLine(x0, 0, x0, stageHeight, white, alpha);
        this.drawLine(x0, y0, x0, y1);
        // (2)
        this.drawLine(x1, 0, x1, stageHeight, white, alpha);
        this.drawLine(x1, y0, x1, y1);
        // (3)
        this.drawLine(0, y0, stageWidth, y0, white, alpha);
        this.drawLine(x0, y0, x1, y0);
        // (4)
        this.drawLine(0, y1, stageWidth, y1, white, alpha);
        this.drawLine(x0, y1, x1, y1);
    };
    DebugDraw.prototype.draw = function (item, color, alpha) {
        if (color === void 0) { color = 0xff0000; }
        if (alpha === void 0) { alpha = 1; }
        if (item instanceof Ray) {
            this.drawLine(item.x0, item.y0, item.x1, item.y1, color, alpha);
        }
        else if (item instanceof Point) {
            this.drawPoint(item.x, item.y, color);
        }
        else if (item instanceof Polygon) {
            this.drawShape(item, color);
        }
        else if (item instanceof PIXI.Rectangle) {
            this.drawRectangle(item.x, item.y, item.x + item.width, item.y + item.height);
        }
        else {
            console.error("I don't know how to draw that shape.");
        }
    };
    /**
      Removes everything on the graphics object. Meant for debugging purposes only.
    */
    DebugDraw.prototype.clear = function () {
        this._graphics.clear();
    };
    DebugDraw.prototype.preUpdate = function () {
        this.clear();
    };
    DebugDraw.prototype.postUpdate = function () {
    };
    DebugDraw.prototype.update = function () {
    };
    return DebugDraw;
})(Component);
var MetaEvents;
(function (MetaEvents) {
    MetaEvents[MetaEvents["AddFirstEvent"] = 0] = "AddFirstEvent";
})(MetaEvents || (MetaEvents = {}));
var Events = (function () {
    function Events(dispatchMetaEvents) {
        if (dispatchMetaEvents === void 0) { dispatchMetaEvents = false; }
        this.metaEvents = null;
        this._events = new MagicDict(function () { return new MagicArray(); });
        this._numEvents = 0;
        if (dispatchMetaEvents) {
            this.metaEvents = new Events();
        }
    }
    Events.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        for (var _a = 0, _b = this._events.get(event); _a < _b.length; _a++) {
            var cb = _b[_a];
            cb.apply(void 0, args);
        }
    };
    Events.prototype.on = function (event, cb) {
        this._events.get(event).push(cb);
        if (this.metaEvents != null && ++this._numEvents == 1) {
            this.metaEvents.emit(MetaEvents.AddFirstEvent);
        }
    };
    Events.prototype.off = function (event, cb) {
        this._events.get(event).remove(cb);
    };
    return Events;
})();
/// <reference path="../../mixins.d.ts"/>
var DebugEvents;
(function (DebugEvents) {
    DebugEvents[DebugEvents["ChangeTarget"] = 0] = "ChangeTarget";
})(DebugEvents || (DebugEvents = {}));
var Debug = (function () {
    function Debug() {
        this.events = new Events();
        this.transformWidget = new TransformWidget();
        Debug.instance = this;
        if (Debug.DEBUG_MODE) {
            this.configureEvents();
        }
    }
    Debug.prototype.configureEvents = function () {
        var _this = this;
        this.events.on(DebugEvents.ChangeTarget, function (newSprite) {
            if (newSprite == null) {
                if (_this.transformWidget.parent) {
                    _this.transformWidget.parent.removeChild(_this.transformWidget);
                }
            }
            else {
                newSprite.addChild(_this.transformWidget);
                _this.transformWidget.x = newSprite.width / 2;
                _this.transformWidget.y = newSprite.height / 2;
            }
        });
    };
    Object.defineProperty(Debug, "debugTarget", {
        /**
         * Get the current Sprite that the debug mode is focused on.
         */
        get: function () {
            return Inspector.instance.props.target;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Are we currently debugging, or not? Turns on a bunch of debugging-only features.
     */
    Debug.DEBUG_MODE = false;
    return Debug;
})();
var Hierarchy = (function (_super) {
    __extends(Hierarchy, _super);
    function Hierarchy(props) {
        _super.call(this);
        this.state = {
            collapsed: props.target.children.length > 20
        };
    }
    Hierarchy.prototype.click = function () {
        this.props.root.setTarget(this.props.target);
    };
    Hierarchy.prototype.toggle = function () {
        this.setState(function (state) {
            state.collapsed = !state.collapsed;
            return state;
        });
    };
    Hierarchy.prototype.render = function () {
        var _this = this;
        var subNodes;
        if (!this.state.collapsed) {
            subNodes = (React.createElement("div", {"className": "prop-list"}, this.props.target.children.map(function (o) {
                return React.createElement(Hierarchy, {"target": o, "debugLayer": _this.props.debugLayer, "root": _this.props.root, "focus": _this.props.focus});
            }).arr()));
        }
        return (React.createElement("div", null, React.createElement("a", {"href": "#", "onClick": function () { return _this.click(); }, "className": this.props.target === this.props.root.state.target ? "target-element" : null}, this.props.target.name), React.createElement("span", {"onClick": function () { return _this.toggle(); }}, " ", this.props.target.children.length > 0 ? (this.state.collapsed ? "[+]" : "[-]") : ""), subNodes));
    };
    return Hierarchy;
})(React.Component);
var InspectorState = (function () {
    function InspectorState() {
    }
    return InspectorState;
})();
var Inspector = (function (_super) {
    __extends(Inspector, _super);
    function Inspector(props) {
        _super.call(this, props);
        this.state = {};
        Inspector.instance = this;
    }
    Inspector.prototype.componentDidUpdate = function () {
        this.drawDebugBox();
    };
    Inspector.prototype.innerPropChange = function () {
        this.drawDebugBox();
        Inspector.instance.forceUpdate();
    };
    Inspector.prototype.drawDebugBox = function () {
        this.props.debugLayer.clear("root");
        if (this.props.target) {
            this.props.debugLayer.drawSprite(this.props.target, "root");
        }
    };
    Inspector.valueToElem = function (value, propName, sprite, interactive, debugLayer) {
        var node;
        var itemArgs = {
            propName: propName,
            target: sprite,
            interactive: interactive,
            debugLayer: debugLayer,
            onPropsChange: function () { return Inspector.instance.innerPropChange(); }
        };
        if (typeof value === "string") {
            node = React.createElement(InspectorItemString, React.__spread({}, itemArgs));
        }
        else if (typeof value === "number" && Util.Contains(propName, "tint")) {
            node = React.createElement(InspectorItemColor, React.__spread({}, itemArgs));
        }
        else if (typeof value === "number") {
            node = React.createElement(InspectorItemNumber, React.__spread({}, itemArgs));
        }
        else if (typeof value === "function") {
        }
        else if (value instanceof PIXI.Point) {
            node = React.createElement(InspectorItemPoint, React.__spread({}, itemArgs));
        }
        else if (value instanceof PIXI.Rectangle) {
            node = React.createElement(InspectorItemRect, React.__spread({}, itemArgs));
        }
        else if (typeof value === "boolean") {
            node = React.createElement(InspectorItemBoolean, React.__spread({}, itemArgs));
        }
        else if (typeof value === "object") {
            node = React.createElement(InspectorItemObject, React.__spread({}, itemArgs));
        }
        else {
            node = React.createElement("div", null, " ", propName, " ");
        }
        return node;
    };
    Inspector.prototype.render = function () {
        if (this.props.target == null) {
            return React.createElement("div", null, " Nothing to inspect. ");
        }
        var propList = [];
        var immutablePropList = [];
        for (var prop in this.props.target) {
            var value = this.props.target[prop];
            var modifiable = this.props.target.inspectableProperties.indexOf(prop) !== -1;
            var node = Inspector.valueToElem(value, prop, this.props.target, modifiable, this.props.debugLayer);
            if (!node)
                continue;
            if (modifiable) {
                propList.push(node);
            }
            else {
                immutablePropList.push(node);
            }
        }
        this.drawDebugBox();
        return (React.createElement("div", {"id": "inspector"}, React.createElement("div", {"className": "title"}, " Inspecting: ", this.props.target.name, " "), React.createElement("div", {"className": "prop-list"}, propList), React.createElement("div", {"className": "dividing-label"}, "Other Properties:"), React.createElement("div", {"className": "prop-list"}, immutablePropList)));
    };
    return Inspector;
})(React.Component);
var InspectorItemBoolean = (function (_super) {
    __extends(InspectorItemBoolean, _super);
    function InspectorItemBoolean(props) {
        _super.call(this, props);
        this.state = { target: props.target };
    }
    InspectorItemBoolean.prototype.changed = function (e) {
        var newValue = e.target.value;
        React.addons.update(this.props.target, (_a = {}, _a[this.props.propName] = { $set: newValue }, _a));
        var _a;
    };
    InspectorItemBoolean.prototype.render = function () {
        var propValue = "" + this.props.target[this.props.propName];
        var value;
        // TODO... lol 
        if (this.props.interactive) {
            value = React.createElement("span", null, " ", propValue, " ");
        }
        else {
            value = React.createElement("span", null, " ", propValue, " ");
        }
        return (React.createElement("div", {"className": "mutableProp"}, React.createElement("span", {"className": "prop-name"}, this.props.propName), ": ", React.createElement("span", {"className": "prop"}, value)));
    };
    return InspectorItemBoolean;
})(React.Component);
var Color = (function () {
    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Color.prototype.toHex = function () {
        return "0x" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
    };
    Color.prototype.toNum = function () {
        return (1 << 24) + (this.r << 16) + (this.g << 8) + this.b;
    };
    Color.fromNum = function (num) {
        var b = num % 256;
        num = Math.floor(num / 256);
        var g = num % 256;
        num = Math.floor(num / 256);
        var r = num % 256;
        return new Color(r, g, b);
    };
    Color.Red = 0xff0000;
    Color.Green = 0x00ff00;
    Color.Blue = 0x0000ff;
    return Color;
})();
var InspectorItemColor = (function (_super) {
    __extends(InspectorItemColor, _super);
    function InspectorItemColor(props) {
        _super.call(this, props);
        this.state = {
            expanded: false,
            color: Color.fromNum(props.target[props.propName])
        };
    }
    InspectorItemColor.prototype.expand = function () {
        this.setState(function (state) {
            state.expanded = !state.expanded;
            return state;
        });
    };
    InspectorItemColor.prototype.change = function (newColor) {
        var _this = this;
        this.setState(function (state) {
            state.color = newColor;
            console.log(newColor.toNum());
            _this.props.target[_this.props.propName] = newColor.toNum();
            _this.props.onPropsChange();
            return state;
        });
    };
    InspectorItemColor.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {"className": "mutableProp"}, this.props.propName, ": ", React.createElement(ColorSquare, {"color": this.state.color, "onClick": function () { return _this.expand(); }}), React.createElement("div", null, this.state.expanded ? React.createElement(InnerInspectorColor, {"color": this.state.color, "onChange": function (newColor) { return _this.change(newColor); }}) : null)));
    };
    return InspectorItemColor;
})(React.Component);
var ColorSquare = (function (_super) {
    __extends(ColorSquare, _super);
    function ColorSquare() {
        _super.apply(this, arguments);
    }
    ColorSquare.prototype.render = function () {
        var square = {
            width: "10px",
            height: "10px",
            border: "1px solid black",
            display: "inline-block",
            background: "rgb(" + this.props.color.r + ", " + this.props.color.g + ", " + this.props.color.b + ")"
        };
        return React.createElement("span", {"style": square, "onClick": this.props.onClick}, " ");
    };
    return ColorSquare;
})(React.Component);
var ColorSlider = (function (_super) {
    __extends(ColorSlider, _super);
    function ColorSlider(props) {
        _super.call(this, props);
        this.mouseDown = false;
        var value;
        if (props.whichColor == "r")
            value = props.color.r;
        if (props.whichColor == "g")
            value = props.color.g;
        if (props.whichColor == "b")
            value = props.color.b;
        this.state = { value: value };
    }
    ColorSlider.prototype.r = function (override) {
        if (override === void 0) { override = null; }
        return this.props.whichColor == "r" ? (override == null ? this.state.value : override) : this.props.color.r;
    };
    ColorSlider.prototype.g = function (override) {
        if (override === void 0) { override = null; }
        return this.props.whichColor == "g" ? (override == null ? this.state.value : override) : this.props.color.g;
    };
    ColorSlider.prototype.b = function (override) {
        if (override === void 0) { override = null; }
        return this.props.whichColor == "b" ? (override == null ? this.state.value : override) : this.props.color.b;
    };
    ColorSlider.prototype.updateValue = function (e) {
        var x = e.pageX - $(e.currentTarget).offset().left;
        var newValue = Math.floor((x / 200) * 255);
        this.props.onChange(React.addons.update(this.props.color, (_a = {}, _a[this.props.whichColor] = { $set: newValue }, _a)));
        var _a;
    };
    ColorSlider.prototype.render = function () {
        var _this = this;
        var gradStart = "rgb(" + this.r(0) + ", " + this.g(0) + ", " + this.b(0) + ")";
        var gradEnd = "rgb(" + this.r(255) + ", " + this.g(255) + ", " + this.b(255) + ")";
        var rect = {
            width: "200px",
            height: "10px",
            border: "1px solid gray",
            margin: "5px",
            background: "-ms-linear-gradient(left, " + gradStart + " 0%, " + gradEnd + " 100%)"
        };
        return React.createElement("div", {"style": rect, "onMouseDown": function (e) { _this.mouseDown = true; _this.updateValue(e); }, "onMouseUp": function () { _this.mouseDown = false; return undefined; }, "onMouseMove": function (e) { return _this.mouseDown && _this.updateValue(e); }}, " ");
    };
    return ColorSlider;
})(React.Component);
var InnerInspectorColor = (function (_super) {
    __extends(InnerInspectorColor, _super);
    function InnerInspectorColor(props) {
        _super.call(this, props);
    }
    InnerInspectorColor.prototype.render = function () {
        var _this = this;
        var style = {
            border: "1px solid gray"
        };
        return React.createElement("div", {"style": style}, React.createElement(ColorSlider, {"color": this.props.color, "whichColor": "r", "onChange": function (c) { return _this.props.onChange(c); }}), React.createElement(ColorSlider, {"color": this.props.color, "whichColor": "g", "onChange": function (c) { return _this.props.onChange(c); }}), React.createElement(ColorSlider, {"color": this.props.color, "whichColor": "b", "onChange": function (c) { return _this.props.onChange(c); }}), React.createElement("div", null, " Hex: ", this.props.color.toHex(), " "));
    };
    return InnerInspectorColor;
})(React.Component);
var InspectorItemFunction = (function (_super) {
    __extends(InspectorItemFunction, _super);
    function InspectorItemFunction() {
        _super.apply(this, arguments);
    }
    InspectorItemFunction.prototype.render = function () {
        return React.createElement("div", null, React.createElement("b", null, this.props.propName), " : [function]");
    };
    return InspectorItemFunction;
})(React.Component);
var InspectorItemNumber = (function (_super) {
    __extends(InspectorItemNumber, _super);
    function InspectorItemNumber(props) {
        _super.call(this, props);
    }
    InspectorItemNumber.prototype.changed = function (e) {
        var newValue = parseInt(e.target.value);
        this.props.target[this.props.propName] = newValue;
        this.props.onPropsChange();
    };
    InspectorItemNumber.prototype.render = function () {
        var _this = this;
        var propValue = "" + this.props.target[this.props.propName];
        var value;
        if (this.props.interactive) {
            value = (React.createElement("input", {"type": "text", "onChange": function (e) { return _this.changed(e); }, "value": propValue}));
        }
        else {
            value = React.createElement("span", null, " ", propValue, " ");
        }
        return (React.createElement("div", {"className": "mutableProp"}, React.createElement("span", {"className": "prop-name"}, this.props.propName), ": ", React.createElement("span", {"className": "prop"}, value)));
    };
    return InspectorItemNumber;
})(React.Component);
var InspectorItemObject = (function (_super) {
    __extends(InspectorItemObject, _super);
    function InspectorItemObject(props) {
        _super.call(this, props);
        this.state = {
            target: props.target,
            expanded: false
        };
    }
    InspectorItemObject.prototype.toggle = function (e) {
        this.setState(function (state) {
            state.expanded = !state.expanded;
            return state;
        });
    };
    InspectorItemObject.prototype.render = function () {
        var _this = this;
        var propList = [];
        var expandedObject = this.state.target[this.props.propName];
        var expandButton = (React.createElement("a", {"href": "#", "onClick": function (e) { return _this.toggle(e); }}, this.state.expanded ? "[-]" : "[+]"));
        if (this.state.expanded) {
            for (var prop in expandedObject) {
                var value = expandedObject[prop];
                var node = Inspector.valueToElem(value, prop, expandedObject, true, this.props.debugLayer);
                if (!node)
                    continue;
                propList.push(node);
            }
        }
        return (React.createElement("div", {"className": "mutableProp"}, React.createElement("div", {"className": "prop-name"}, " ", expandButton, " ", Util.GetClassName(expandedObject), " ", React.createElement("span", {"className": "prop"}, this.props.propName), " "), React.createElement("div", {"className": "prop-list"}, propList)));
    };
    return InspectorItemObject;
})(React.Component);
var InspectorItemPoint = (function (_super) {
    __extends(InspectorItemPoint, _super);
    function InspectorItemPoint(props) {
        _super.call(this, props);
    }
    Object.defineProperty(InspectorItemPoint.prototype, "point", {
        get: function () {
            return this.props.target[this.props.propName];
        },
        enumerable: true,
        configurable: true
    });
    InspectorItemPoint.prototype.changed = function (e) {
        var newValue = e.target.value;
        this.props.target[this.props.propName] = newValue;
        this.props.onPropsChange();
    };
    InspectorItemPoint.prototype.mouseEnter = function () {
        this.props.debugLayer.drawPoint(this.point.x, this.point.y, this.props.propName);
    };
    InspectorItemPoint.prototype.mouseLeave = function () {
        this.props.debugLayer.clear(this.props.propName);
    };
    InspectorItemPoint.prototype.render = function () {
        var _this = this;
        var propValue = "" + this.props.target[this.props.propName];
        var value;
        return (React.createElement("div", {"className": "mutableProp", "onMouseEnter": function () { return _this.mouseEnter(); }, "onMouseLeave": function () { return _this.mouseLeave(); }}, React.createElement("span", {"className": "prop-name"}, this.props.propName, ": "), React.createElement("span", {"className": "prop"}, "x: ", this.point.x, " y: ", this.point.y)));
    };
    return InspectorItemPoint;
})(React.Component);
var InspectorItemRect = (function (_super) {
    __extends(InspectorItemRect, _super);
    function InspectorItemRect(props) {
        _super.call(this, props);
    }
    Object.defineProperty(InspectorItemRect.prototype, "rect", {
        get: function () {
            return this.props.target[this.props.propName];
        },
        enumerable: true,
        configurable: true
    });
    InspectorItemRect.prototype.changed = function (e) {
        var newValue = e.target.value;
        this.props.target[this.props.propName] = newValue;
        this.props.onPropsChange();
    };
    InspectorItemRect.prototype.mouseEnter = function () {
        if (this.rect) {
            this.props.debugLayer.drawRect(this.rect.x, this.rect.y, this.rect.x + this.rect.width, this.rect.y + this.rect.height, this.props.propName);
        }
    };
    InspectorItemRect.prototype.mouseLeave = function () {
        this.props.debugLayer.clear(this.props.propName);
    };
    InspectorItemRect.prototype.render = function () {
        var _this = this;
        var propValue = "" + this.props.target[this.props.propName];
        var value;
        if (this.rect) {
            value = React.createElement("span", null, " x: ", this.rect.x, " y: ", this.rect.y, " w: ", this.rect.width, " h: ", this.rect.height, " ");
        }
        else {
            value = React.createElement("span", null, " [null] ");
        }
        return (React.createElement("div", {"className": "mutableProp", "onMouseEnter": function () { return _this.mouseEnter(); }, "onMouseLeave": function () { return _this.mouseLeave(); }}, React.createElement("span", {"className": "prop-name"}, this.props.propName, ": "), React.createElement("span", {"className": "prop"}, value)));
    };
    return InspectorItemRect;
})(React.Component);
var InspectorItemString = (function (_super) {
    __extends(InspectorItemString, _super);
    function InspectorItemString(props) {
        _super.call(this, props);
    }
    InspectorItemString.prototype.changed = function (e) {
        var newValue = e.target.value;
        this.props.target[this.props.propName] = newValue;
        this.props.onPropsChange();
    };
    InspectorItemString.prototype.render = function () {
        var _this = this;
        var propValue = "" + this.props.target[this.props.propName];
        var value;
        if (this.props.interactive) {
            value = (React.createElement("input", {"type": "text", "onChange": function (e) { return _this.changed(e); }, "value": propValue}));
        }
        else {
            value = React.createElement("span", null, " \"", propValue, "\" ");
        }
        return (React.createElement("div", {"className": "mutableProp"}, React.createElement("span", {"className": "prop-name"}, this.props.propName), ": ", React.createElement("span", {"className": "prop"}, value)));
    };
    return InspectorItemString;
})(React.Component);
var LogItemType;
(function (LogItemType) {
    LogItemType[LogItemType["Normal"] = 0] = "Normal";
    LogItemType[LogItemType["Error"] = 1] = "Error";
})(LogItemType || (LogItemType = {}));
var LogProps = (function () {
    function LogProps() {
    }
    return LogProps;
})();
var LogState = (function () {
    function LogState() {
    }
    return LogState;
})();
var DebugLayer = (function () {
    function DebugLayer(stage) {
        this._layers = new MagicDict();
        this._stage = stage;
        this._stage.addChild(this._container = new Sprite());
        this._container.baseName = "Debug";
        this._container.z = Number.POSITIVE_INFINITY; // force debugging info to top of screen
    }
    DebugLayer.prototype.getLayerForComponent = function (identifier) {
        var result;
        if (!this._layers.contains(identifier)) {
            result = this._container.addChild(this._layers.put(identifier, new Sprite()));
            result.baseName = identifier;
        }
        else {
            result = this._layers.get(identifier);
        }
        return result;
    };
    DebugLayer.prototype.drawPoint = function (x, y, identifier) {
        var layer = this.getLayerForComponent(identifier);
        layer.debug.drawPoint(x, y);
    };
    DebugLayer.prototype.drawRect = function (x0, y0, x1, y1, identifier) {
        var layer = this.getLayerForComponent(identifier);
        layer.debug.drawRectangle(x0, y0, x1, y1);
    };
    DebugLayer.prototype.drawSprite = function (sprite, identifier) {
        var layer = this.getLayerForComponent(identifier);
        var x0 = sprite.absolutePosition.x;
        var y0 = sprite.absolutePosition.y;
        layer.debug.drawRectangle(x0, y0, x0 + sprite.width, y0 + sprite.height);
    };
    DebugLayer.prototype.clear = function (identifier) {
        var layer = this.getLayerForComponent(identifier);
        if (!layer) {
            // TODO - could use fancy console logging here for sprites... IF I HAD IT
            console.error("Um, that layer doesn't exist...");
            return;
        }
        layer.debug.clear();
    };
    return DebugLayer;
})();
var Log = (function (_super) {
    __extends(Log, _super);
    function Log(props) {
        _super.call(this, props);
        this.state = { contents: consoleCache };
        this.overrideConsoleLog();
    }
    Log.prototype.overrideConsoleLog = function () {
        // setTimeout is necessary so we don't call setState within a render function - we want to 
        // be able to console.log from anywhere. 
        var _this = this;
        console.log = function () {
            var s = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                s[_i - 0] = arguments[_i];
            }
            var caller = _this.getCallingFunction();
            setTimeout(function () { return _this.log(caller, s); });
        };
        console.error = function () {
            var s = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                s[_i - 0] = arguments[_i];
            }
            var caller = _this.getCallingFunction();
            setTimeout(function () { return _this.error(caller, s); });
        };
    };
    // GetCallingFunction
    //
    // Will get the function that called the function that you call GetCallingFunction() inside.
    // Only tested on IE.
    // 
    // For example:
    //
    // foo() { 
    //   console.log(GetCallingFunction()); // bar
    // }
    //
    // bar () {
    //   foo();
    // }
    // The stacktrace provided by e.stack looks like this:
    // [0]: "Error: myError"
    // [1]: "   at Util.StackTrace (http://localhost:58550/main.js?0.6854253500429788:106:13)"
    // [2]: "   at eval code (eval code:1:1)"
    // [3]: "   at Log.log (http://localhost:58550/main.js?0.6854253500429788:158:13)"
    // [4]: "   at callingFunction (http://localhost:58550/main.js?0.6854253500429788:384:9)"
    // [5]: "   at Anonymous function (http://localhost:58550/main.js?0.6854253500429788:390:31)"
    Log.prototype.getCallingFunction = function () {
        try {
            throw new Error('myError');
        }
        catch (e) {
            var trace = e.stack;
            var lineOfCaller = trace.split("\n")[3];
            // TODO: This regex does not handle anonymous functions in Chrome very well.
            var parts = lineOfCaller.match(/ at (([\w<>\.]+) |Anonymous function |Global code |.{0})\(https?:\/\/\w+:?\d{0,5}\/(\w+\.js)[^:]+\:(\d+)\:(\d+)\)/);
            // matches [, function name, , file name, line, column]
            var functionName = parts[1].replace(".prototype.", "#");
            var fileName = parts[3];
            var line = parseInt(parts[4]);
            var column = parseInt(parts[5]);
            // TODO: turn TiledMapParser.prototype.process into TiledMapParser#process
            if (!sourceMaps[fileName]) {
                // It's dang near impossible to procede from this point, since waiting on source
                // maps to load would be an asynchronous process that would clobber the stack trace.
                return "[source maps not loaded]";
            }
            // There is some other Position object from lib.d.ts clobbering source-map's Position,
            // hence the any cast.
            var original = new sourceMap.SourceMapConsumer(sourceMaps[parts[3]])
                .originalPositionFor({ line: line, column: column });
            var originalFile;
            try {
                originalFile = original.source.split("/")[original.source.split("/").length - 1];
            }
            catch (e) {
                originalFile = "<unknown>";
            }
            return original.name + " (" + originalFile + ":" + original.line + ")";
        }
    };
    Log.prototype.log = function (caller, content) {
        this.logHelper(caller, content, LogItemType.Normal);
    };
    Log.prototype.error = function (caller, content) {
        this.logHelper(caller, content, LogItemType.Error);
    };
    Log.prototype.logHelper = function (metadata, content, logItemType) {
        this.setState(function (prev) {
            var last = prev.contents[prev.contents.length - 1];
            if (Util.ArrayEq(last.content, content)) {
                last.count++;
            }
            else {
                prev.contents.push({ content: content, metadata: metadata, logItemType: logItemType, count: 1 });
            }
            return prev;
        });
    };
    Log.prototype.componentWillUpdate = function () {
        var node = React.findDOMNode(this);
        this.shouldScrollBottom = node.scrollTop + node.offsetHeight >= node.scrollHeight;
    };
    Log.prototype.componentDidUpdate = function () {
        if (this.shouldScrollBottom) {
            var node = React.findDOMNode(this);
            node.scrollTop = node.scrollHeight;
        }
    };
    Log.loggableToHTML = function (content, debugLayer, root) {
        if (typeof content === "string") {
            return React.createElement(LogItemString, {"content": content});
        }
        else if (typeof content === "number") {
            return React.createElement("span", null, " ", content.toString(), " ");
        }
        else if (content instanceof Array) {
            var items = content.map(function (o) { return Log.loggableToHTML(o, debugLayer, root); });
            return React.createElement("span", null, " [", items, "] ");
        }
        else if (content instanceof PIXI.Rectangle) {
            return React.createElement(LogItemRect, {"rect": content, "debug": debugLayer});
        }
        else if (content instanceof PIXI.Point) {
            return React.createElement(LogItemPoint, {"point": content.clone(), "debugLayer": debugLayer});
        }
        else if (content instanceof PIXI.Texture) {
            return React.createElement(LogItemTexture, {"texture": content, "debugLayer": debugLayer});
        }
        else if (content instanceof Sprite) {
            return React.createElement(LogItemSprite, {"sprite": content, "root": root, "debugLayer": debugLayer});
        }
        else if (typeof content === "object") {
            // Note - this check should definitely come last.
            return React.createElement(LogItemObject, {"object": content, "debugLayer": debugLayer, "root": root});
        }
        return React.createElement("span", null, "???????", content, " ");
    };
    Log.prototype.render = function () {
        var _this = this;
        var logContent = this.state.contents.map(function (item, index) {
            return React.createElement("div", {"className": "log-entry"}, React.createElement("span", {"className": "number less-important"}, index, " "), React.createElement("span", {"className": item.logItemType == LogItemType.Normal ? "log-normal" : "log-error"}, item.content.map(function (content) { return Log.loggableToHTML(content, _this.props.debugLayer, _this.props.root); }), React.createElement("span", {"className": "count"}, item.count > 1 ? "(" + item.count + ")" : "")), React.createElement("span", {"className": "log-from"}, React.createElement("span", {"className": "less-important"}, " from "), item.metadata));
        });
        return React.createElement("div", {"className": "log"}, React.createElement("div", {"className": "log-title"}, "Log"), logContent);
    };
    return Log;
})(React.Component);
var LogItemObject = (function (_super) {
    __extends(LogItemObject, _super);
    function LogItemObject(props) {
        _super.call(this, props);
        this.state = { expanded: false };
    }
    LogItemObject.prototype.toggle = function (e) {
        this.setState(function (state) {
            state.expanded = !state.expanded;
            return state;
        });
    };
    LogItemObject.prototype.render = function () {
        var inner = [];
        for (var key in this.props.object) {
            var item = this.props.object[key];
            inner.push(React.createElement("div", null, React.createElement("b", null, key), ": ", item ? item.toString() : "<null>"));
        }
        return (React.createElement("span", {"className": "object"}, inner));
    };
    return LogItemObject;
})(React.Component);
var LogItemPoint = (function (_super) {
    __extends(LogItemPoint, _super);
    function LogItemPoint(props) {
        _super.call(this, props);
        this.state = { expanded: true };
    }
    LogItemPoint.prototype.toggle = function (e) {
        this.setState(function (state) {
            state.expanded = !state.expanded;
            return state;
        });
    };
    LogItemPoint.prototype.mouseOver = function (e) {
        this.props.debugLayer.drawPoint(this.props.point.x, this.props.point.y, "point");
    };
    LogItemPoint.prototype.mouseOut = function (e) {
        this.props.debugLayer.clear("point");
    };
    LogItemPoint.prototype.render = function () {
        var _this = this;
        var inner;
        if (this.state.expanded) {
            inner = React.createElement("span", null, React.createElement("span", {"className": "prop"}, " x"), ": ", this.props.point.x, React.createElement("span", {"className": "prop"}, " y"), ": ", this.props.point.y);
        }
        else {
            inner = React.createElement("span", null, " point ");
        }
        return (React.createElement("span", {"className": "point", "onMouseOver": function (e) { return _this.mouseOver(e); }, "onMouseOut": function (e) { return _this.mouseOut(e); }, "onClick": function (e) { return _this.toggle(e); }}, inner));
    };
    return LogItemPoint;
})(React.Component);
var LogItemRect = (function (_super) {
    __extends(LogItemRect, _super);
    function LogItemRect(props) {
        _super.call(this, props);
        this.debug = props.debug;
        this.state = {
            rect: new PIXI.Rectangle(props.rect.x, props.rect.y, props.rect.width, props.rect.height),
            expanded: false
        };
    }
    LogItemRect.prototype.toggle = function (e) {
        this.setState(function (state) {
            state.expanded = !state.expanded;
            return state;
        });
    };
    LogItemRect.prototype.mouseOver = function (e) {
        this.debug.drawRect(this.state.rect.x, this.state.rect.y, this.state.rect.x + this.state.rect.width, this.state.rect.y + this.state.rect.height, "rect");
    };
    LogItemRect.prototype.mouseOut = function (e) {
        this.debug.clear("rect");
    };
    LogItemRect.prototype.render = function () {
        var _this = this;
        var inner;
        if (this.state.expanded) {
            inner = React.createElement("span", null, React.createElement("span", {"className": "prop"}, " x"), ": ", this.state.rect.x, React.createElement("span", {"className": "prop"}, " y"), ": ", this.state.rect.y, React.createElement("span", {"className": "prop"}, " width"), ": ", this.state.rect.width, React.createElement("span", {"className": "prop"}, " height"), ": ", this.state.rect.height);
        }
        else {
            inner = React.createElement("span", null, " rect ");
        }
        return (React.createElement("span", {"className": "rect", "onMouseOver": function (e) { return _this.mouseOver(e); }, "onClick": function (e) { return _this.toggle(e); }, "onMouseOut": function (e) { return _this.mouseOut(e); }}, inner));
    };
    return LogItemRect;
})(React.Component);
var SpriteCanvas = (function (_super) {
    __extends(SpriteCanvas, _super);
    function SpriteCanvas(sprite, element) {
        _super.call(this, sprite.width, sprite.height, element);
        this.stage.addChild(sprite.clone());
    }
    return SpriteCanvas;
})(Game);
var LogItemSprite = (function (_super) {
    __extends(LogItemSprite, _super);
    function LogItemSprite(props) {
        _super.call(this, props);
        this.state = { expanded: false };
        this._oldSprite = props.sprite;
    }
    LogItemSprite.prototype.shouldComponentUpdate = function () {
        var result = this.props.sprite !== this._oldSprite;
        this._oldSprite = this.props.sprite;
        return result;
    };
    LogItemSprite.prototype.renderSprite = function () {
        new SpriteCanvas(this.props.sprite, React.findDOMNode(this));
    };
    // Called after first render.
    LogItemSprite.prototype.componentDidMount = function () {
        this.renderSprite();
    };
    // Called after every render except first.
    LogItemSprite.prototype.componentDidUpdate = function (prevProps, prevState) {
        this.renderSprite();
    };
    LogItemSprite.prototype.showSpriteDebugRectangle = function () {
        this.props.debugLayer.drawSprite(this.props.sprite, "logsprite");
    };
    LogItemSprite.prototype.hideSpriteDebugRectangle = function () {
        this.props.debugLayer.clear("logsprite");
    };
    LogItemSprite.prototype.setAsTarget = function () {
        this.props.root.setTarget(this.props.sprite);
    };
    LogItemSprite.prototype.render = function () {
        var _this = this;
        return React.createElement("span", {"onMouseOver": function () { return _this.showSpriteDebugRectangle(); }, "onMouseOut": function () { return _this.hideSpriteDebugRectangle(); }, "onMouseDown": function () { return _this.setAsTarget(); }}, " ");
    };
    return LogItemSprite;
})(React.Component);
var LogItemString = (function (_super) {
    __extends(LogItemString, _super);
    function LogItemString(props) {
        _super.call(this, props);
        this.state = { content: props.content };
    }
    LogItemString.prototype.render = function () {
        return React.createElement("span", null, " ", this.state.content, " ");
    };
    return LogItemString;
})(React.Component);
var TextureCanvas = (function (_super) {
    __extends(TextureCanvas, _super);
    function TextureCanvas(texture, element) {
        _super.call(this, texture.width, texture.height, element);
        var texturedSprite = new Sprite([], texture.baseTexture.imageUrl);
        this.stage.addChild(texturedSprite);
    }
    return TextureCanvas;
})(Game);
var LogItemTexture = (function (_super) {
    __extends(LogItemTexture, _super);
    function LogItemTexture(props) {
        _super.call(this, props);
        this.oldTextureUrl = "";
        this.state = {};
    }
    LogItemTexture.prototype.renderTexture = function () {
        var _this = this;
        this.oldTextureUrl = this.props.texture.baseTexture.imageUrl;
        var showTexture = function () {
            new TextureCanvas(_this.props.texture, React.findDOMNode(_this));
        };
        if (this.props.texture.baseTexture.hasLoaded) {
            showTexture();
        }
        else {
            setTimeout(showTexture, 0);
        }
    };
    LogItemTexture.prototype.shouldComponentUpdate = function () {
        return this.props.texture.baseTexture.imageUrl != this.oldTextureUrl;
    };
    // Called after first render.
    LogItemTexture.prototype.componentDidMount = function () {
        this.renderTexture();
    };
    // Called after every render except first.
    LogItemTexture.prototype.componentDidUpdate = function (prevProps, prevState) {
        this.renderTexture();
    };
    LogItemTexture.prototype.render = function () {
        return React.createElement("div", null, " Imatexture! ");
    };
    return LogItemTexture;
})(React.Component);
var TransformWidget = (function (_super) {
    __extends(TransformWidget, _super);
    function TransformWidget() {
        var _this = this;
        _super.call(this);
        this.displayObject.interactive = true;
        this.draw();
        this.events.on(SpriteEvents.ChangeParent, function (parent) {
            _this._target = parent;
        });
        this.debug.events.on(SpriteEvents.MouseDown, function (point) {
            if (_this._downArrow.contains(point)) {
                _this._target.y += 10;
            }
            if (_this._rightArrow.contains(point)) {
                _this._target.x += 10;
            }
        });
        this.debug.events.on(SpriteEvents.MouseUp, function () {
            console.log("goodbye");
        });
    }
    TransformWidget.prototype.draw = function () {
        this._downArrow = new Polygon([
            new Point(-10, 50),
            new Point(10, 50),
            new Point(0, 70)
        ]);
        this._rightArrow = new Polygon([
            new Point(50, -10),
            new Point(50, 10),
            new Point(70, 0)
        ]);
        this.debug.drawLine(0, 0, 0, 50, 0xffffff, 1);
        this.debug.drawLine(0, 0, 50, 0, 0xffffff, 1);
        this.debug.drawShape(this._downArrow, Color.Red);
        this.debug.drawShape(this._rightArrow, Color.Red);
    };
    return TransformWidget;
})(Sprite);
var Globals = (function () {
    function Globals() {
    }
    Globals.initialize = function (stage) {
        Globals.physicsManager = new PhysicsManager();
        Globals.keyboard = new Keyboard();
        Globals.mouse = new Mouse(stage);
        Globals.stage = Globals.stage || stage;
    };
    return Globals;
})();
var KeyInfo = (function () {
    function KeyInfo() {
    }
    KeyInfo.Keys = "qwertyuiopasdfghjklzxcvbnm".split("");
    return KeyInfo;
})();
var Keyboard = (function () {
    function Keyboard() {
        var _this = this;
        this.down = new KeyInfo();
        this.justDown = new KeyInfo();
        addEventListener("keydown", function (e) { return _this.keyDown(e); }, false);
        addEventListener("keyup", function (e) { return _this.keyUp(e); }, false);
    }
    Keyboard.prototype.keyUp = function (e) {
        if (KeyInfo.Keys.indexOf(e.key) !== -1) {
            this.down[e.key.toUpperCase()] = false;
        }
    };
    Keyboard.prototype.keyDown = function (e) {
        if (KeyInfo.Keys.indexOf(e.key) !== -1) {
            this.down[e.key.toUpperCase()] = true;
        }
    };
    return Keyboard;
})();
var MouseEvents;
(function (MouseEvents) {
    MouseEvents[MouseEvents["MouseDown"] = 0] = "MouseDown";
})(MouseEvents || (MouseEvents = {}));
var Mouse = (function () {
    function Mouse(stage) {
        var _this = this;
        this.position = new Point(0, 0);
        this.events = new Events();
        stage.displayObject.on('mousemove', function (e) { return _this.mousemove(e); });
        stage.displayObject.on('mouseup', function (e) { return _this.mouseup(e); });
        stage.displayObject.on('mousedown', function (e) { return _this.mousedown(e); });
    }
    Mouse.prototype.mousemove = function (e) {
        this.position.x = e.data.global.x;
        this.position.y = e.data.global.y;
    };
    Mouse.prototype.mousedown = function (e) {
        this.down = true;
        this.events.emit(MouseEvents.MouseDown, new Point(e.data.global.x, e.data.global.y));
    };
    Mouse.prototype.mouseup = function (e) {
        this.down = false;
    };
    return Mouse;
})();
/**
 * Mixin decorator.

  As cool as this is, I currently consider it to be an anti-pattern because
  without proper language support it violates DRY.

function mixin(...a: any[]) {
  return (target: any) => {
    a.forEach((baseCtor: any) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        // If you mixin one object into another using the provided TypeScript mixin code,
        // we'd overwrite the old constructor with the new constructor function.

        // This is obviously not what we want.

        if (name === "constructor") {
          return;
        }

        target.prototype[name] = baseCtor.prototype[name];
      })
    });
  }
}

*/
var Ray = (function () {
    function Ray(x0, y0, x1, y1) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
    }
    Object.defineProperty(Ray.prototype, "start", {
        get: function () { return new Point(this.x0, this.y0); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ray.prototype, "end", {
        get: function () { return new Point(this.x1, this.y1); },
        enumerable: true,
        configurable: true
    });
    Ray.FromPoints = function (start, end) {
        return new Ray(start.x, start.y, end.x, end.y);
    };
    return Ray;
})();
var PhysicsManager = (function () {
    function PhysicsManager() {
        this._sprites = new MagicArray();
    }
    PhysicsManager.prototype.moveSpriteX = function (sprite, dx) {
        var rayStartX = sprite.x + (dx > 0 ? sprite.width : 0);
        var rayEndX = rayStartX + dx;
        var raySpacing = 2;
        for (var y = sprite.y; y < sprite.y + sprite.height; y += raySpacing) {
            var ray = new Ray(rayStartX, y, rayEndX, y);
            sprite.debug.draw(ray);
        }
    };
    PhysicsManager.prototype.moveSpriteY = function (sprite, dy) {
        // const firstRayY = new Point(dy
        sprite.y += dy;
    };
    PhysicsManager.prototype.moveSprite = function (sprite, dx, dy) {
        // x
        if (dx != 0)
            this.moveSpriteX(sprite, dx);
        if (dy != 0)
            this.moveSpriteY(sprite, dy);
    };
    PhysicsManager.prototype.update = function () {
        // move all sprites
        for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            this.moveSprite(sprite, sprite.physics.dx, sprite.physics.dy);
        }
        for (var _b = 0, _c = this._sprites; _b < _c.length; _b++) {
            var sprite = _c[_b];
            sprite.physics.reset();
        }
    };
    PhysicsManager.prototype.add = function (sprite) {
        this._sprites.push(sprite);
    };
    /**
     * Raycasts from a given ray, returning the first sprite that the ray intersects.
     * Ignores any sprite that the start of the ray is already colliding with.
     *
     * @param ray
     * @returns {}
     */
    PhysicsManager.prototype.raycast = function (ray) {
        // TODO could (should) use a quadtree or something
        var result = undefined;
        for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            if (Util.RectPointIntersection(sprite.bounds, ray.start)) {
                // The ray started in this sprite; disregard
                continue;
            }
            Util.RayRectIntersection(ray, sprite.bounds).then(function (position) {
                if (result === undefined ||
                    ray.start.distance(position) < ray.start.distance(result.position)) {
                    result = {
                        position: position,
                        sprite: sprite
                    };
                }
            });
        }
        return new Maybe(result);
    };
    return PhysicsManager;
})();
var PhysicsComponent = (function (_super) {
    __extends(PhysicsComponent, _super);
    function PhysicsComponent(physics) {
        _super.call(this);
        this.dx = 0;
        this.dy = 0;
        this.touchingBottom = false;
        this.touchingTop = false;
        this.touchingRight = false;
        this.touchingLeft = false;
        this.solid = physics.solid;
        this.immovable = physics.immovable;
    }
    PhysicsComponent.prototype.init = function (sprite) {
        _super.prototype.init.call(this, sprite);
        Globals.physicsManager.add(sprite);
    };
    PhysicsComponent.prototype.moveBy = function (dx, dy) {
        this.dx = dx;
        this.dy = dy;
    };
    /**
     * Resets any physics changes the attached Sprite would have received on this turn.
     * @returns {}
     */
    PhysicsComponent.prototype.reset = function () {
        this.dx = 0;
        this.dy = 0;
    };
    PhysicsComponent.prototype.postUpdate = function () { };
    PhysicsComponent.prototype.preUpdate = function () { };
    PhysicsComponent.prototype.update = function () { };
    return PhysicsComponent;
})(Component);
var Point = (function (_super) {
    __extends(Point, _super);
    function Point(x, y) {
        _super.call(this, x, y);
    }
    Point.prototype.distance = function (other) {
        return Math.sqrt(Math.pow(other.x - this.x, 2) +
            Math.pow(other.y - this.y, 2));
    };
    Point.prototype.add = function (other) {
        return new Point(this.x + other.x, this.y + other.y);
    };
    return Point;
})(PIXI.Point);
/**
 * Root is the react component at the base of the HTML hierarchy.
 */
var Root = (function (_super) {
    __extends(Root, _super);
    function Root(props) {
        _super.call(this, props);
        var debugLayer = new DebugLayer(this.props.stage);
        this.state = {
            target: null,
            debugLayer: debugLayer
        };
    }
    Root.prototype.setTarget = function (target) {
        this.setState(function (state) {
            state.target = target;
            return state;
        });
        Debug.instance.events.emit(DebugEvents.ChangeTarget, target);
    };
    Root.prototype.render = function () {
        var hierarchy = null, inspector = null, log = null;
        if (this.props.debug && Debug.DEBUG_MODE) {
            hierarchy = React.createElement(Hierarchy, {"root": this, "target": this.props.stage, "debugLayer": this.state.debugLayer, "focus": this.state.target});
            inspector = React.createElement(Inspector, {"debugLayer": this.state.debugLayer, "target": this.state.target});
        }
        if (this.props.debug) {
            log = React.createElement(Log, {"stage": this.props.stage, "debugLayer": this.state.debugLayer, "root": this});
        }
        return (React.createElement("div", null, React.createElement("div", {"id": "main-panel"}, React.createElement("div", {"id": "hierarchy"}, hierarchy), React.createElement("div", {"id": "content", "className": "content"}), inspector), log));
    };
    return Root;
})(React.Component);
var SpriteEvents;
(function (SpriteEvents) {
    SpriteEvents[SpriteEvents["AddChild"] = 0] = "AddChild";
    SpriteEvents[SpriteEvents["MouseDown"] = 1] = "MouseDown";
    SpriteEvents[SpriteEvents["MouseUp"] = 2] = "MouseUp";
    SpriteEvents[SpriteEvents["ChangeParent"] = 3] = "ChangeParent";
})(SpriteEvents || (SpriteEvents = {}));
var Stage = (function (_super) {
    __extends(Stage, _super);
    /**
     * Stage is the Sprite at the top of the display hierarchy.
     */
    function Stage(width, height, debug) {
        if (debug === void 0) { debug = false; }
        _super.call(this);
        this.baseName = "Stage";
        this.currentMousedObject = null;
        this.width = width;
        this.height = height;
        this.displayObject.hitArea = new PIXI.Rectangle(0, 0, width, height);
        this.displayObject.interactive = true;
        if (debug) {
            this.displayObject.on('mousedown', this.mousedown, this);
        }
    }
    Object.defineProperty(Stage.prototype, "width", {
        /**
         * The width of the Stage. (readonly)
         */
        get: function () { return this._width; },
        set: function (val) { this._width = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "height", {
        /**
         * The height of the Stage. (readonly)
         */
        get: function () { return this._height; },
        set: function (val) { this._height = val; },
        enumerable: true,
        configurable: true
    });
    Stage.prototype.setRoot = function (root) {
        this.root = root;
    };
    Stage.prototype.findSpritesAt = function (point) {
        var sprites = this.getAllSprites();
        return sprites.filter(function (o) {
            return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
                point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
        });
    };
    Stage.prototype.mousedown = function (e) {
        var point = new Point(e.data.global.x, e.data.global.y);
        var target = this.findTopmostSpriteAt(point, true);
        this.root.setTarget(target);
    };
    Stage.prototype.mousemove = function (e) {
        var point = e.data.global;
        if (point.x < 0 || point.x > this.width || point.y < 0 || point.y > this.height) {
            return;
        }
        if (Debug.DEBUG_MODE) {
            var newMousedObject = this.findTopmostSpriteAt(point, true);
            if (newMousedObject != this.currentMousedObject) {
                if (newMousedObject != null) {
                    newMousedObject.alpha = 0.9;
                }
                if (this.currentMousedObject != null) {
                    this.currentMousedObject.alpha = 1.0;
                }
                this.currentMousedObject = newMousedObject;
            }
        }
    };
    Stage.prototype.removeChild = function (sprite) {
        this.displayObject.removeChild(sprite.displayObject);
    };
    /**
      Maps DisplayObjects to Sprites associated to those DisplayObjects.
    */
    Stage.doToSprite = new MagicDict();
    return Stage;
})(Sprite);
//# sourceMappingURL=main.js.map