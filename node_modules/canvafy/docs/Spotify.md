<h1 id="spotify">Spotify</h1>
<h3>Spotify card builder</h3>

```js
new canvafy.Spotify()
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
  * [setAlbum](#set-album)
  * [setAuthor](#set-author)
  * [setBackground](#set-background)
  * [setBarBackgroundColor](#set-bar-background-color)
  * [setBarColor](#set-bar-color)
  * [setForegroundColor](#set-foreground-color)
  * [setForegroundOpacity](#set-foreground-opacity)
  * [setImage](#set-image)
  * [setTitle](#set-title)
  * [setTimestamp](#set-timestamp)
  
  </td></tr>
  </tbody>
</table>

<h2 id="build">.build()</h2>
<h3>Build the spotify card</h3>

PARAMETER | TYPE | DESCRIPTION
--- | --- | ---
options | [BuildOptions](https://github.com/squarfiuz/canvafy/tree/main/docs/typedef/BuildOptions.md) | Build options

Scope: `ASYNC`

Returns: [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<Buffer>

<h2 id="set-album">.setAlbum(name)</h2>
<h3>Set the album name</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
name | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Name of the album | Alan Walker Album

Returns: [Spotify](#spotify)

<h2 id="set-author">.setAuthor(name)</h2>
<h3>Set the author name</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
name | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Name of the author | Alan Walker, Ava Max

<h2 id="set-background">.setBackground(type, value)</h2>
<h3>Set the background color/image</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
type | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Type between 'color' and 'background | background
value | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Background URL or hexadecimal color | https://someimage.com/background.png

<h2 id="set-bar-color">.setBarColor(color)</h2>
<h3>Set the the bar color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #1db954

<h2 id="set-bar-background-color">.setBarBackgroundColor(color)</h2>
<h3>Set the the bar background color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #e8e8e8

<h2 id="set-foreground-color">.setForegroundColor(color)</h2>
<h3>Set the the foreground color</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
color | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Hexadecimal color | #2a2e35

<h2 id="set-foreground-opacity">.setForegroundOpacity(opacity)</h2>
<h3>Set the foreground opacity</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
opacity | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Number between 0 and 1 (0 and 1 included) | 0.8

<h2 id="set-image">.setImage(image)</h2>
<h3>Set the music image</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
image | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - [Buffer](https://developer.mozilla.org/en-US/docs/Glossary/buffer) - [Canvas.Image](https://www.tabnine.com/code/javascript/functions/canvas/loadImage) | Image of the music | https://someimage.com/image.png

<h2 id="set-title">.setTitle(title)</h2>
<h3>Set the card's description</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
title | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Title of the music | Alone, Pt II

<h2 id="set-timestamp">.setTimestamp(start, end)</h2>
<h3>Set the music time</h3>

PARAMETER | TYPE | DESCRIPTION | EXAMPLE
--- | --- | --- | ---
start | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Start time in miliseconde | 40000
end | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | End time in miliseconde | 179000