# Lightbox Novembre

## Options

| Name | Type | Default | Description |
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
| animation.open | `function` |  | Lightbox opening animation |
| animation.close | `function` | | Lightbox closing animation |
| animation.showElement | `function` | | Lightbox displaying element animation |

### Example
```javascript
const lightbox = new Lightbox({
    uid: "lightbox-1",
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
