# version 300 es
precision highp float;

// uniform vec4 u_Color; // The color with which to render this instance of geometry.
// uniform sampler2D depthMap;
// uniform mat4 u_ViewProj;
// uniform vec3 u_LightPos;
// uniform vec3 u_CameraPos;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_LightSpacePos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{
    vec3 color = vec3(fs_Col);
    out_Col = vec4(color, 1.0);
    // return;
    // vec3 normal = normalize(vec3(fs_Nor));
    // vec3 lightColor = vec3(1.0);
    // // ambient
    // vec3 ambient = 0.15 * color;
    // // diffuse
    // // vec3 lightDir = normalize(u_LightPos - vec3(fs_Pos));
    // vec3 lightDir = vec3(0.0,0.0,1.0);
    // float diff = max(dot(lightDir, normal), 0.0);
    // vec3 diffuse = diff * lightColor;
    // // specular
    // vec3 viewDir = normalize(u_CameraPos - vec3(fs_Pos));
    // float spec = 0.0;
    // vec3 halfwayDir = normalize(lightDir + viewDir);  
    // spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    // vec3 specular = spec * lightColor;    
    // // calculate shadow
    // vec3 lighting = clamp((ambient +  (diffuse + specular)) * color, vec3(0.0), vec3(1.0));
    // out_Col = vec4(lighting, 1.0);
}
