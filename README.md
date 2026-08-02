# src/assets

This app currently loads its fonts (Google Fonts) and QR codes (api.qrserver.com)
from external URLs, so there are no bundled local images yet.

If you want to add your own logo or dish photos, drop image files in this
folder and import them in `App.jsx` like:

```js
import logo from "./assets/logo.png";
// then use it: <img src={logo} />
```
