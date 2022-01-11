
const bottomControls = document.querySelector('.js-bottom-controls')
const topControls = document.querySelector('.js-top-controls')
const showingCurrentColor = document.querySelector('.js-current-color');
document.body.style.height = window.innerHeight
const r = Math.round;

// WALL
const wall = document.getElementById('js-wall')
const ctx = wall.getContext('2d')
const canvasWidth = window.innerWidth
const canvasHeight = window.innerHeight - (bottomControls.offsetHeight + topControls.offsetHeight)
const canvasTopOffset = topControls.offsetHeight
wall.setAttribute('width', canvasWidth)
wall.setAttribute('height', canvasHeight)
wall.style.width = canvasWidth + 'px'
wall.style.height = canvasHeight + 'px'
setWallBackground('white') 


// PALLETE 
const palleteMenu = document.querySelector('.js-pallete-modal')
const pallete = document.querySelector('.js-pallete-colors')
const palleteResult = document.querySelector('.js-pallete-result')
const palleteOpacityRange = document.querySelector('.js-pallete-range')
const DEFAULT_COLOR = '#800080'

// PEN 
const penMenu = document.querySelector('.js-pen-modal')

// Разобраться с линией
const LINE_WIDTH = 10
ctx.lineWidth = 20
ctx.lineCap = 'round'

setCurrentColor(DEFAULT_COLOR, 1)

function setCurrentColor(color) {
    let currentColor = color
    ctx.strokeStyle = currentColor
    ctx.fillStyle = currentColor
    showingCurrentColor.style.backgroundColor = currentColor
}

function setWallBackground(color) { 
    wall.style.backgroundColor = color
}

if (bottomControls) {
    bottomControls.addEventListener('click', function (e) {
        let buttonType = e.target.dataset.button
        if (buttonType === 'eraser') {
            setCurrentColor('255,255,255')
        }

        if (buttonType === 'pallete') {
            setModal(palleteMenu)
        }

        // if (buttonType === 'pen') {
        //     setModal(penMenu)
        // }

        if (buttonType === 'fill') {
            const color = window.getComputedStyle(showingCurrentColor).backgroundColor
            setWallBackground(color)
            
        }
    })
}

function drawing() {
    // для трюка 
    let isMouseDown = false

    wall.addEventListener('mousedown', (e) => {
        isMouseDown = true
        // для того, чтобы при рисовании новой линии, не было связи со старой
        ctx.beginPath()
        ctx.arc(e.clientX, e.clientY - canvasTopOffset, LINE_WIDTH, 0, Math.PI * 2)
        ctx.fill()

        ctx.closePath()
        ctx.beginPath()
    })

    wall.addEventListener('mouseup', () => {
        isMouseDown = false
    })

    wall.addEventListener('mousemove', (e) => {

        if (isMouseDown) {
            ctx.lineTo(e.clientX, e.clientY - canvasTopOffset)
            ctx.stroke()

            // для заполнения пробелов при рисовании линии
            // ctx.beginPath()
            // ctx.arc(e.clientX, e.clientY - canvasTopOffset, LINE_WIDTH, 0, Math.PI * 2)
            // ctx.fill()

            ctx.beginPath()
            ctx.moveTo(e.clientX, e.clientY - canvasTopOffset)
        }
    })
}

if (palleteMenu) {
    palleteResult.style.backgroundColor = DEFAULT_COLOR
    palleteOpacityRange.style.background = `linear-gradient(90deg, rgba(255,255,255,1) 0%, ${DEFAULT_COLOR} 100%)`
}


function setColorPallete(e) {
    if (e.target.nodeName === 'LI') {
        const color = window.getComputedStyle(e.target).backgroundColor // rgb(0,0,0)
        palleteResult.style.backgroundColor = color
        palleteOpacityRange.style.background = `linear-gradient(90deg, rgba(255,255,255,1) 0%, ${color} 100%)`
        setCurrentColor(color)

        palleteOpacityRange.addEventListener('change', (e) => {
            let opacity = '1'

            if (e.target.value !== '10') {
                opacity = `0.${e.target.value}`
            }

            palleteResult.style.opacity = opacity
            console.log(color, opacity);
            const canvasColor = blend(color, '#ffffff', 1-opacity)
            console.log(color, canvasColor, opacity);
            setCurrentColor(canvasColor)
        })
    }
}

function setModal(element) {
    element.classList.add('open-modal')

    Array.from(element.children).forEach(v => {
        if (v.classList.contains('overlay')) {
            v.addEventListener('click', () => {
                element.classList.remove('open-modal')
            })
        }
    })
}

if (wall) {
    drawing()
}

if (pallete) {
    pallete.addEventListener('click', (e) => setColorPallete(e))
}


function toRGBA(d) {
	const l = d.length;
	const rgba = {};
	if (d.slice(0, 3).toLowerCase() === 'rgb') {
		d = d.replace(' ', '').split(',');
		rgba[0] = parseInt(d[0].slice(d[0][3].toLowerCase() === 'a' ? 5 : 4), 10);
		rgba[1] = parseInt(d[1], 10);
		rgba[2] = parseInt(d[2], 10);
		rgba[3] = d[3] ? parseFloat(d[3]) : -1;
	} else {
		if (l < 6) d = parseInt(String(d[1]) + d[1] + d[2] + d[2] + d[3] + d[3] + (l > 4 ? String(d[4]) + d[4] : ''), 16);
		else d = parseInt(d.slice(1), 16);
		rgba[0] = (d >> 16) & 255;
		rgba[1] = (d >> 8) & 255;
		rgba[2] = d & 255;
		rgba[3] = l === 9 || l === 5 ? r((((d >> 24) & 255) / 255) * 10000) / 10000 : -1;
	}
	return rgba;
}

function blend(from, to, p = 0.5) {
	from = from.trim();
	to = to.trim();
	const b = p < 0;
	p = b ? p * -1 : p;
	const f = toRGBA(from);
	const t = toRGBA(to);
	if (to[0] === 'r') {
		return 'rgb' + (to[3] === 'a' ? 'a(' : '(') +
			r(((t[0] - f[0]) * p) + f[0]) + ',' +
			r(((t[1] - f[1]) * p) + f[1]) + ',' +
			r(((t[2] - f[2]) * p) + f[2]) + (
				f[3] < 0 && t[3] < 0 ? '' : ',' + (
					f[3] > -1 && t[3] > -1
						? r((((t[3] - f[3]) * p) + f[3]) * 10000) / 10000
						: t[3] < 0 ? f[3] : t[3]
				)
			) + ')';
	}

	return '#' + (0x100000000 + ((
		f[3] > -1 && t[3] > -1
			? r((((t[3] - f[3]) * p) + f[3]) * 255)
			: t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255
		) * 0x1000000) +
		(r(((t[0] - f[0]) * p) + f[0]) * 0x10000) +
		(r(((t[1] - f[1]) * p) + f[1]) * 0x100) +
		r(((t[2] - f[2]) * p) + f[2])
	).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3);
}