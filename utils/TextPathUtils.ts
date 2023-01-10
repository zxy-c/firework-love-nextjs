import ArrayUtils from "@zxy-cn/array-utils";
import {Font, Glyph} from "opentype.js";
import BezierUtils, {Point} from "./BezierUtils";
import {func} from "prop-types";

export function getTextDensePoints( glyph:Glyph, x:number, y:number, fontSize:number):Array<Point>{
    const pointDistance = 5;
    let path = glyph.getPath(x,y,fontSize);
    return path.commands.flatMap((command,index)=>{
        if (command.type==="Z"){
            return []
        } else if (command.type == "M"){
            return [[command.x,command.y]]
        } else if (command.type=="C"){
            let prevCommand = path.commands[index-1];
            if (prevCommand.type!=="Z"){
                const prevX = prevCommand.x, prevY =prevCommand.y
                let length = BezierUtils.getThreeOrderBezierLength([prevX,prevY],[command.x1,command.y1],[command.x2,command.y2],[command.x,command.y]);
                return ArrayUtils.generate(Math.ceil(length/pointDistance),index=>{
                    return BezierUtils.getThreeOrderBezierPoint(index/length*pointDistance,[prevX,prevY],[command.x1,command.y1],[command.x2,command.y2],[command.x,command.y]);
                })
            }else {
                return []
            }
        }else if (command.type=="Q"){
            let prevCommand = path.commands[index-1];
            if (prevCommand.type!=="Z"){
                const prevX = prevCommand.x, prevY =prevCommand.y
                let length = BezierUtils.getTwoOrderBezierLength([prevX,prevY],[command.x1,command.y1],[command.x,command.y]);
                return ArrayUtils.generate(Math.ceil(length/pointDistance),index=>{
                    return BezierUtils.getTwoOrderBezierPoint(index/length*pointDistance,[prevX,prevY],[command.x1, command.y1],[command.x,command.y]);
                })
            }else {
                return []
            }
        }else if (command.type == "L"){
            let prevCommand = path.commands[index-1];
            if (prevCommand.type!=="Z"){
                const x1 = prevCommand.x,y1 = prevCommand.y,x2 = command.x,y2 = command.y
                const func = (x:number)=> {
                    return (x-x1)* (y1-y2)/(x1-x2) + y1
                }
                let length = Math.abs(x1-x2);
                return ArrayUtils.generate(Math.ceil(length/pointDistance),index=>{
                    let x = index/length*pointDistance;
                    let y = func(x);
                    return [x,y]
                })
            }else {
                return []
            }
        }else {
            return []
        }
    }).filter(it=>it.length==2).map(it => it as Point)
}