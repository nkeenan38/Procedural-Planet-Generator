import { vec3 } from "gl-matrix";
import { type } from "os";

export var gl: WebGL2RenderingContext;
export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;
}

export function readTextFile(file: string): string
{
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}

export function randColor(): vec3
{
    let color = vec3.create();
    color[0] = Math.random();
    color[1] = Math.random();
    color[2] = Math.random();
    return color;
}

export function mix(a: vec3, b: vec3, t: number): vec3
{
    let result = vec3.create();
    vec3.scale(result, a, 1 - t);
    vec3.scaleAndAdd(result, result, b, t);
    return result;
}