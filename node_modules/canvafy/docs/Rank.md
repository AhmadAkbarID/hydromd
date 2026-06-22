<h1 id="rank">Rank</h1>
<h3>Rank card builder</h3>

```js
new canvafy.Rank()
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
  * [setBackground](#set-background)
  * [setBarColor](#set-bar-color)
  * [setBarOpacity](#set-bar-opacity)
  * [setBorder](#set-border)
  * [setCurrentXp](#set-current-xp)
  * [setCustomStatus](#set-custom-status)
  * [setDiscriminator](#set-discriminator)
  * [setForegroundColor](#set-foreground-color)
  * [setForegroundOpacity](#set-foreground-opacity)
  * [setLevel](#set-level)
  * [setLevelColor](#set-level-color)
  * [setRank](#set-rank)
  * [setRankColor](#set-rank-color)
  * [setRequiredXp](#set-required-xp)
  * [setStatus](#set-status)
  * [setUsername](#set-username)
  
  </td></tr>
  </tbody>
</table>

<h2 id="build">.build([options])</h2>
<h3>Build the rank card</h3>

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

Returns: [Rank](#rank)

<h2 id="set-background">.setBackground(type, value)</h2>
<h3>Set the background color/image</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
type | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Type between 'color' and 'background | background
value | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - [Buffer](https://developer.mozilla.org/en-US/docs/Glossary/buffer) - [Canvas.Image](https://www.tabnine.com/code/javascript/functions/canvas/loadImage) | Background or hexadecimal color | https://someimage.com/background.png / #ff5555

Returns: [Rank](#rank)

<h2 id="set-bar-color">.setBarColor(color)</h2>
<h3>Set the progressbar color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #5b58f2

Returns: [Rank](#rank)

<h2 id="set-bar-opacity">.setBarOpacity(opacity)</h2>
<h3>Set the progressbar opacity</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
opacity | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Number between 0 and 1 (0 and 1 included) | 1

Returns: [Rank](#rank)

<h2 id="set-border">.setBorder(color)</h2>
<h3>Set the border color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #70db6C

Returns: [Rank](#rank)

<h2 id="set-current-xp">.setCurrentXp(xp, [color])</h2>
<h3>Set the current XP</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
xp | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Current XP number | 200
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color of current XP text | #000

Returns: [Rank](#rank)

<h2 id="set-custom-status">.setCustomStatus(color)</h2>
<h3>Set the color of the avatar's border</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color of border avatar color | #ff5555

Returns: [Rank](#rank)

<h2 id="set-discriminator">.setDiscriminator(discriminator, [color])</h2>
<h3>Set the user discriminator</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
discriminator | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Discriminator of the user | 7777
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color of discriminator | #fff

Returns: [Rank](#rank)

<h2 id="set-foreground-color">.setForegroundColor(color)</h2>
<h3>Set the the foreground color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #2a2e35

Returns: [Rank](#rank)

<h2 id="set-foreground-opacity">.setForegroundOpacity(opacity)</h2>
<h3>Set the foreground opacity</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
opacity | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Number between 0 and 1 (0 and 1 included) | 0.8

Returns: [Rank](#rank)

<h2 id="set-level">.setLevel(data, [text])</h2>
<h3>Set the level</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
data | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Level Number | 1
text | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Level text | Level

Returns: [Rank](#rank)

<h2 id="set-level-color">.setLevelColor(options)</h2>
<h3>Set the level color</h3>

PARAMETER | TYPE | DESCRIPTION
--- | --- | ---
options | [LevelColorOptions](https://github.com/squarfiuz/canvafy/tree/main/docs/typedef/LevelColorOptions.md) | The options for the level color

Returns: [Rank](#rank)

<h2 id="set-rank">.setRank(data, [text])</h2>
<h3>Set the rank</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
data | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Level Number | 1
text | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Level text | Level

Returns: [Rank](#rank)

<h2 id="set-rank-color">.setRankColor(options)</h2>
<h3>Set the rank color</h3>

PARAMETER | TYPE | DESCRIPTION
--- | --- | ---
options | [RankColorOptions](https://github.com/squarfiuz/canvafy/tree/main/docs/typedef/RankColorOptions.md) | The options for the rank color

Returns: [Rank](#rank)

<h2 id="set-required-xp">.setRequiredXp(xp, [color])</h2>
<h3>Set the required XP</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
xp | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Required XP number | 400
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color of required XP text | #000

Returns: [Rank](#rank)

<h2 id="set-status">.setStatus(status)</h2>
<h3>Set the status for the avatar's border</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
status | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Discord status for set the avatar's border color | online/idle/dnd/stream/offline

Returns: [Rank](#rank)

<h2 id="set-username">.setUsername(username, [color])</h2>
<h3>Set the user username</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
username | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Username of the user | squarfiuz
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color of username | #fff

Returns: [Rank](#rank)