function formatViews(views) {
  if (!views) return "0"

  // limpiar texto (views, votes, comas, etc)
  views = parseInt(views.toString().replace(/[^\d]/g, ""))

  if (views >= 1000000000)
    return (views / 1000000000).toFixed(1).replace(".0","") + "B"

  if (views >= 1000000)
    return (views / 1000000).toFixed(1).replace(".0","") + "M"

  if (views >= 1000)
    return (views / 1000).toFixed(1).replace(".0","") + "K"

  return views.toString()
}

module.exports = { formatViews }