// graph ui settings

// *****


// getChartColors(array: Array<any>) {
//   let calculatedSettings = [];
//   array.forEach(item => {
//     const chartColor = 'rgb('
//       + Math.round(( Math.random() * 1000) % 255) + ', '
//       + Math.round((Math.random() * 1000) % 255) + ', '
//       + Math.round((Math.random() * 1000) % 255) + ')';
//
//   const templateSettings = {
//     borderColor: chartColor,
//     backgroundColor: chartColor,
//     pointBorderColor: [],
//     pointBorderWidth: []
//   };
//
//   let pointBorderColor = new Array(item.data.length).fill('');
//   let pointBorderWidth = new Array(item.data.length).fill('2');
//   this.filterByDeviation(item.data).forEach(pointedIndex => {
//     pointBorderColor[pointedIndex] = chartColor;
//   pointBorderWidth[pointedIndex] = '8';
// });
//   templateSettings.pointBorderColor = pointBorderColor;
//   templateSettings.pointBorderWidth = pointBorderWidth;
//
//   calculatedSettings.push(templateSettings);
// });
//   return calculatedSettings;
// }
