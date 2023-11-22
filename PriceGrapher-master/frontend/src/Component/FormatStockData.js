const formatStockData = (stockData) => {
    console.log("ss",stockData)

    const formattedData = []
        Object.entries(
            stockData
        ).map(
            ([key, value]) =>
            {
                formattedData.push({
                    date: new Date(key),
                    open:Number(value['1. open']),
                    high:Number(value['2. high']),
                    low:Number(value['3. low']),
                    close:Number(value['4. close']),
                    volume:Number(value['5. volume'])
                })
            }
        )
    console.log("form", formattedData)
    return formattedData
}

export default formatStockData;
