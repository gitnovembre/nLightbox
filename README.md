# Lightbox Novembre

## Options

| Name | Type | Default value | Description |
| :--- | :---: | :---: | :--- |
| uid | `string` | `unidid()` | Unique lightbox identifier |
| enableCloseOnBlur | `boolean` | `true` | Close on click outside of the content |
| enableCloseOnEscape | `boolean` | `true` | Close on pressing the escape key |
| enableArrowKey | `boolean` | `true` | Navigate between the elements with the arrow keys |
| enableAnimations | `boolean` | `true` | Use animation to make smooth transitions |
| enableCloseUI | `boolean` | `true` | Display the close button |
| enableNavUI | `boolean` | `true` | Display the navigation buttons |
| enablePaginationUI | `boolean` | `true` | Display the pagination information |
| enableBulletlistUI | `boolean` | `true` | Display a bulletlist navigation |
| animation.open | `function` | - | Lightbox opening animation |
| animation.close | `function` | - | Lightbox closing animation |
| animation.showElement | `function` | - | Lightbox displaying element animation |

### Example
```javascript
const lightbox = new Lightbox({
    uid: 'lightbox-1',
    enableCloseOnBlur: true,
    enableCloseOnEscape: true,
    enableArrowKey: false,
    enableAnimations: false,
    enableCloseUI: false,
    enableNavUI: false,
    enablePaginationUI: false,
    enableBulletlistUI: true,
    animation: {
      open: () => { ... },
      close: () => { ... },
      showElement: () => { ... },
    }
});
```

## API

### init(customTypes = `[]`) 
Initilize lightbox creation, events, and fragment detection

| Parameter | Type | Info |
| :--- | :--- | :--- |
| customTypes | `Array` | Register custom lightbox types |  

```javascript
lightbox.init();
```

### feed(data)

| Parameter | Type | Info |
| :--- | :--- | :--- |
| data | `string`, `Array` | Raw data directly added to the lightbox without parsing the DOM |  

```javascript
const json = `[
    { 
        "target": "#test1", 
        "group": "lightbox-1", 
        "type": "youtube", 
        "src": "https://www.youtube.com/watch?v=QwUq8xM_8bY", 
        "autoplay": true, 
        "start": 120, 
        "rel": false, 
        "showinfo": false, 
        "controls": true, 
        "allowFullscreen": false 
    },
    { 
        "target": "#test2", 
        "group": "lightbox-1", 
        "type": "youtube", 
        "src": "https://www.youtube.com/watch?v=9rIy0xY99a0", 
        "autoplay": false, 
        "rel": false, 
        "showinfo": false,
        "controls": true, 
        "allowFullscreen": false 
    },
]`;

lightbox.feed(json);
```


### on(eventName, callback)
Register a global lightbox event listener

| Parameter | Type | Info |
| :--- | :--- | :--- |
| eventName | `string` | Available events are `close`, `open`, `change.before`, and `change.after` |
| callback | `function` | Function to be called when the event is fired | 

```javascript
lightbox.on('open', () => {
    console.info('OPEN');
});
```


### keyExists(key) => `boolean`
Returns true if the given element key exists

| Parameter | Type | Info |
| :--- | :--- | :--- |
| key | `string` | Element UID |

```javascript
if (lightbox.keyExists('test')) { 
    ...
}
```


### open() => `Promise`
Opens the lightbox and returns a `Promise`

```javascript
lightbox.open().then(() => {
    console.info('OPENED');
})
```


### close() => `Promise`
Closes the lightbox and returns a `Promise`


### toggle() => `Promise`
Toggles open/close actions and returns a `Promise` 


### next()
Loads (if not loaded yet) and displays the next element

```javascript
lightbox.next();
```

### prev()
Loads (if not loaded yet) and displays the previous element


### jumpToIndex(i)
Loads (if not loaded yet) and displays the element at the given index (0 to n-1)
Lightbox has to be already opened.

| Parameter | Type | Info |
| :--- | :--- | :--- |
| i | `number` | Element index |


### jumpToKey(key)
Loads (if not loaded yet) and displays the element with the given key
Lightbox has to be already opened.

| Parameter | Type | Info |
| :--- | :--- | :--- |
| key | `string` | Element UID |


### isOpen() => `boolean`
Returns true if the lightbox is open


### disableUI()
Turns the UI off


### enableUI()
Turns the UI on


### toggleUI()
Toggles the UI on/off


### count() => `number`
Returns the current number of elements


## Fragment URL

Options to control the lightbox directly from the URL fragment. Parameters are written in the same format as query strings.

| Name | Type | Default | Description |
| :---: | :--- | :---: | :--- |
| g | `string` | | Target lightbox UID |
| k | `string` | | Target element by UID (has priority over the index parameter if present) |
| i | `number`, `string` | `0` | Target element by index or keywords (`first`, `last` or `random`) |
| s | `number` | `-1` | Target lightbox element UID |
| d | `number` | `-1` | Target lightbox element UID |
| f | `number` | `1` | Target lightbox element UID |

### Example
```
http://localhost:1234/#g=lightbox-1&d=1000&i=5
```
