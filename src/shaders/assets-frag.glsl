# version 300 es
precision highp float;

uniform vec4 u_Color;
uniform sampler2D depthMap;
uniform sampler2D depthMapInstanced;
uniform mat4 u_ViewProj;
uniform vec3 u_LightPos;
uniform vec3 u_CameraPos;
uniform int u_LightingEnabled;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec2 fs_UV;
in vec4 fs_LightSpacePos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.


float shadowCalculation(vec4 lightSpacePos, vec3 normal, vec3 lightDir)
{
    vec3 projCoords = lightSpacePos.xyz / lightSpacePos.w;
    projCoords = projCoords * 0.5 + 0.5; 
    if(projCoords.z > 1.0)
        return 0.0;
    float closestDepth = texture(depthMap, projCoords.xy).r; 
    float currentDepth = projCoords.z; 
    float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.0005);  
    float shadow = 0.0;
    vec2 texelSize = vec2(1.0 / float(textureSize(depthMap, 0).x), 1.0 / float(textureSize(depthMap, 0).y));
    for(int x = -1; x <= 1; ++x)
    {
        for(int y = -1; y <= 1; ++y)
        {
            float pcfDepth = texture(depthMap, projCoords.xy + vec2(float(x), float(y)) * texelSize).r; 
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;        
        }    
    }
    shadow /= 9.0;
    return shadow;
}

void main()
{
    vec3 color = vec3(fs_Col);
    if (u_LightingEnabled == 1)
    {
        vec3 normal = normalize(vec3(fs_Nor));
        vec3 lightColor = vec3(1.0);
        // ambient
        vec3 ambient = 0.25 * color;
        // diffuse
        vec3 lightDir = normalize(u_LightPos - vec3(fs_Pos));
        float diff = max(dot(lightDir, normal), 0.0);
        vec3 diffuse = diff * lightColor;
        // specular
        vec3 viewDir = normalize(vec3(fs_Pos));
        float spec = 0.0;
        vec3 halfwayDir = normalize(lightDir + viewDir);  
        spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
        vec3 specular = spec * lightColor;    
        // calculate shadow
        float shadow = shadowCalculation(fs_LightSpacePos, normal, lightDir); 
        vec3 lighting = clamp((ambient + (1.0 - shadow) * (diffuse + specular)) * color, vec3(0.0), vec3(1.0));
        out_Col = vec4(lighting, 1.0);
    }
    else
    {
        vec3 normal = normalize(vec3(fs_Nor));
        vec3 lightColor = vec3(1.0);
        // ambient
        vec3 ambient = 0.15 * color;
        // diffuse
        vec3 lightDir = normalize(vec3(fs_Pos));
        float diff = max(dot(lightDir, normal), 0.0);
        vec3 diffuse = diff * lightColor;
        // specular
        vec3 lighting = clamp(ambient + diffuse * color, vec3(0.0), vec3(1.0));
        out_Col = vec4(lighting, 1.0);
    }
}
