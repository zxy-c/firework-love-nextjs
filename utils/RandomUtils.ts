function randomItemFromArray<T>(array:Array<T>):T{
    return array[Math.floor(randomNumberFromRange(0,array.length))]
}

function randomNumberFromRange(start:number,end:number):number{
    return start + Math.random() * (end - start)
}

export default {
    randomItemFromArray,
    randomNumberFromRange
}