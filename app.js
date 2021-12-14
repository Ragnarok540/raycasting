const mat4 = glMatrix.mat4

const vertex_shader_source = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main () {
    fragColor = vertColor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}`

const fragment_shader_source = `
precision mediump float;

varying vec3 fragColor;

void main () {
    gl_FragColor = vec4(fragColor, 1.0);
}`

function init_demo() {
    const canvas = document.querySelector("#glCanvas")
    const gl = canvas.getContext("webgl")

    if (gl === null) {
        alert("Unable to initialize WebGL.")
        return
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const vertex_shader = gl.createShader(gl.VERTEX_SHADER)
    const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER)

    gl.shaderSource(vertex_shader, vertex_shader_source)
    gl.shaderSource(fragment_shader, fragment_shader_source)

    gl.compileShader(vertex_shader)
    check_shader(gl, vertex_shader)

    gl.compileShader(fragment_shader)
    check_shader(gl, fragment_shader)

    const program = gl.createProgram()
    gl.attachShader(program, vertex_shader)
    gl.attachShader(program, fragment_shader)

    gl.linkProgram(program)
    gl.validateProgram(program)
    check_program(gl, program)

    const triangle_vertices = [
        0.0, 0.5, 0.0, 1.0, 1.0, 0.0,
        -0.5, -0.5, 0.0, 0.7, 0.0, 1.0,
        0.5, -0.5, 0.0, 0.1, 1.0, 0.6
    ]

    const triangle_vertex_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle_vertex_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertices), gl.STATIC_DRAW)

    const position_attrib_location = gl.getAttribLocation(program, 'vertPosition')
    const color_attrib_location = gl.getAttribLocation(program, 'vertColor')
    gl.vertexAttribPointer(position_attrib_location, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0)
    gl.vertexAttribPointer(color_attrib_location, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)
    gl.enableVertexAttribArray(position_attrib_location)
    gl.enableVertexAttribArray(color_attrib_location)

    gl.useProgram(program)

    const mat_world_uniform_location = gl.getUniformLocation(program, 'mWorld')
    const mat_view_uniform_location = gl.getUniformLocation(program, 'mView')
    const mat_proj_uniform_location = gl.getUniformLocation(program, 'mProj')

    let world_matrix = new Float32Array(16)
    let view_matrix = new Float32Array(16)
    let proj_matrix = new Float32Array(16)

    mat4.identity(world_matrix)
    mat4.lookAt(view_matrix, [0, 0, -5], [0, 0, 0], [0, 1, 0])
    mat4.perspective(proj_matrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0)

    gl.uniformMatrix4fv(mat_world_uniform_location, gl.FALSE, world_matrix)
    gl.uniformMatrix4fv(mat_view_uniform_location, gl.FALSE, view_matrix)
    gl.uniformMatrix4fv(mat_proj_uniform_location, gl.FALSE, proj_matrix)
    
    let identity_matrix = new Float32Array(16)
    mat4.identity(identity_matrix)
    let angle = 0

    function loop() {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI
        mat4.rotate(world_matrix, identity_matrix, angle, [0, 1, 0])
        gl.uniformMatrix4fv(mat_world_uniform_location, gl.FALSE, world_matrix)

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 3)

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)

    console.log("init demo")
}

function check_shader(gl, shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader!', gl.getShaderInfoLog(shader), gl.getShaderParameter(shader, gl.SHADER_TYPE))
    }
}

function check_program(gl, program) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program!', gl.getProgramInfoLog(program))
    }

    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('Error validating program!', gl.getProgramInfoLog(program))
    }
}
