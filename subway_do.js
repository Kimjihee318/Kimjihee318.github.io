var dataSet = [];

d3.csv('data/대중교통_통행량_16년_.csv',function(err,data){
data.forEach(function(row,i){
    var rowPlace = row['구분1'];
    delete row['구분1'];
    for(key in row){
      dataSet.push ({
        place : rowPlace,
        date : key,
        value : row[key],


      });


    }
});
console.log(dataSet);
});
