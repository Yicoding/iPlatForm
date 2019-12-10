const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 数字格式化
 */
const AmtFormat = (val, fixed = 2) => {
  if (!!!val) {
    return '0.00';
  }
  return Number(val).toFixed(fixed);
}

module.exports = {
  formatTime: formatTime,
  AmtFormat: AmtFormat
}
