module.exports = (err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
