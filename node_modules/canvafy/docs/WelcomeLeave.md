<h1 id="welcome-leave">Welcome And Leave</h1>
<h3>Welcome and leave card builder</h3>

```js
new canvafy.WelcomeLeave()
```

<table>
  <thead>
    <tr>
      <td>METHODS</td>
    </tr>
  </thead>
  <tbody>
  <tr><td width=100% valign=top>

  * [build](#build)
  * [setAvatar](#set-avatar)
  * [setAvatarBorder](#set-avatar-border)
  * [setBackground](#set-background)
  * [setBorder](#set-border)
  * [setDescription](#set-description)
  * [setOverlayOpacity](#set-overlay-opacity)
  * [setTitle](#set-title)
  
  </td></tr>
  </tbody>
</table>

<h2 id="build">.build([options])</h2>
<h3>Build the welcome/leave card</h3>

Scope: `ASYNC`

PARAMETER | TYPE | DESCRIPTION
--- | --- | ---
options | [BuildOptions](https://github.com/squarfiuz/canvafy/tree/main/docs/typedef/BuildOptions.md) | Build options

Returns: [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<Buffer>

<h2 id="set-avatar">.setAvatar(image)</h2>
<h3>Set the user avatar</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
image | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - [Buffer](https://developer.mozilla.org/en-US/docs/Glossary/buffer) - [Canvas.Image](https://www.tabnine.com/code/javascript/functions/canvas/loadImage) | Avatar image | https://someimage.com/avatar.png

Returns: [WelcomeLeave](#welcome-leave)

<h2 id="set-avatar-border">.setAvatarBorder(color)</h2>
<h3>Set the avatar's border color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #2a2e35

Returns: [WelcomeLeave](#welcome-leave)

<h2 id="set-background">.setBackground(type, value)</h2>
<h3>Set the background color/image</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
type | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Type between 'color' and 'background | background
value | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - [Buffer](https://developer.mozilla.org/en-US/docs/Glossary/buffer) - [Canvas.Image](https://www.tabnine.com/code/javascript/functions/canvas/loadImage) | Background or hexadecimal color | https://someimage.com/background.png / #ff5555

Returns: [WelcomeLeave](#welcome-leave)

<h2 id="set-border">.setBorder(color)</h2>
<h3>Set the border color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #2a2e35

Returns: [WelcomeLeave](#welcome-leave)

<h2 id="set-description">.setDescription(text, [color])</h2>
<h3>Set the card's description</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
text | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Description of the card | Welcome to you!
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #a7b9c5

Returns: [WelcomeLeave](#welcome-leave)

<h2 id="set-overlay-opacity">.setOverlayOpacity(opacity)</h2>
<h3>Set the card's description</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
opacity | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Number between 0 and 1 (0 and 1 included) | 0

Returns: [WelcomeLeave](#welcome-leave)

<h2 id="set-title">.setTitle(text, [color])</h2>
<h3>Set the card's title</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
text | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Title of the card | Welcome
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #fff

Returns: [WelcomeLeave](#welcome-leave)