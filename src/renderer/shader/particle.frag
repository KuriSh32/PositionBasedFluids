#version 430 core

in vec3 viewSpacePos;
in vec3 aColor;

out vec4 FragColor;

vec2 POINT_CENTER = vec2(0.5, 0.5);
uniform mat4 projection;
uniform mat4 viewMatrixInverseTranspose;
uniform float POINT_SIZE;

struct Light {
    vec3 direction;
    vec3 color;
    float ambient;
    float diffuse;
    float specular;
    float shininess;
};
uniform Light light;
uniform vec3 viewPos;

void main() {
    vec3 normalViewSpace;
    normalViewSpace.xy = (gl_PointCoord - POINT_CENTER) * vec2(2.0, -2.0);
    float xy_length = length(normalViewSpace.xy);
    if (xy_length > 1.0) {
        discard;
    }
    normalViewSpace.z = sqrt(1.0 - xy_length);

    vec3 fragPosViewSpace = viewSpacePos + normalViewSpace * POINT_SIZE;
    vec4 fragPosClipSpace = projection * vec4(fragPosViewSpace, 1.0);

    gl_FragDepth = fragPosClipSpace.z / fragPosClipSpace.w;

    vec3 lightDir = normalize((viewMatrixInverseTranspose * vec4(light.direction, 0.0)).xyz);
    vec3 viewDir = normalize(-fragPosViewSpace);
    vec3 halfDir = normalize(viewDir + lightDir);

    vec3 ambient = light.ambient * light.color;

    float diff = max(dot(normalViewSpace, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * light.color;

    float spec = pow(max(dot(normalViewSpace, halfDir), 0.0), light.shininess);
    vec3 specular = light.specular * spec * light.color;

    vec3 result = (ambient + diffuse + specular) * aColor;

    // FragColor = vec4(normal, 1.0);
    // FragColor = vec4(vec3(gl_FragDepth), 1.0);
    FragColor = vec4(result, 1.0);
}
