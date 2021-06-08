//第五节课：给模型添加动作，在加载的时候显示loading。。
import * as THREE from 'three'
import React, { useRef, useEffect, useCallback, useState } from 'react'
import EarthImage from './texture/earth.jpg'
import MoonImage from './texture/moon.jpg'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import StoneImage from './texture/guangze.jpg'
import { Progress, Button } from 'antd'
import 'antd/dist/antd.css'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Camera, LoadingManager, PerspectiveCamera } from 'three'
//引入组件库，创建加载的样式。

import { render } from '@testing-library/react'
//ref.current vs ref?
//
//useRef获取组件对象节点对象，threejs要把对象存放到canvas中，我们要获取到。

const Animation = () => {
	//记录鼠标的情况
	const [loaded, setLoaded] = useState(50)
	const isDown = useRef(false)
	const body = useRef()
	const id = useRef(null)
	const angle = useRef(45) //相机初始角度为90
	const R = useRef(75) //半径为100
	//坐标轴辅助红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴.
	const scene = useRef(new THREE.Scene()).current //只创建一次scene不会每次都重新渲染
	const camera = useRef(new THREE.PerspectiveCamera()).current
	const renderer = useRef(new THREE.WebGL1Renderer({ antialias: true })).current //会帮我们创建canvas,renderer.domElement就是返回的canvas
	//物体数组
	const projects = useRef([]).current
	//灯光数组
	const lights = useRef([]).current
	const floor = useRef(null)
	//拖拽镜头
	const mouseDown = useCallback(() => {
		isDown.current = true
	}, [])
  //记录当前的帧数
  const clock = useRef(new THREE.Clock())
  const mixer = useRef(new THREE.AnimationMixer())
	const mouseWhell = useCallback((event) => {
		//deltaY代表鼠标滑轮下滑 半径增大
		if (event.deltaY > 0) R.current += 1
		else R.current -= 1
		const y = camera.position.y
		const x = R.current * Math.cos((angle.current * Math.PI) / 180)
		const z = R.current * Math.sin((angle.current * Math.PI) / 180)
		camera.position.set(x, y, z)
		camera.lookAt(0, 0, 0)
	})
	//引入Gtxfbx模型
  const loaderManager = new LoadingManager()
	const loadGtxFbx = useCallback(() => {
		loaderManager.onStart = (_, loaded, total) => {
			setLoaded(loaded)
		}
    loaderManager.onProgress = (_,loaded,total)=>{
      setLoaded(loaded)
    }
		const loader = new FBXLoader(loaderManager)
		loader.setPath('/')
		loader.load('gtx2.fbx', (obj) => {
			obj.position.set(0, 0, 0)
			obj.scale.set(0.1, 0.1, 0.1)
      mixer.current = new THREE.AnimationMixer(obj)
      console.log(obj)
      const annimated = mixer.current.clipAction(obj.animations[0])
      annimated.setLoop(true)
      annimated.play()
			projects.push(obj)
			scene.add(obj)
		})
	}, [])
	//引入宇航员模型
	const loadYhyFbx = useCallback(() => {
    loaderManager.onProgress = (_,loaded,total)=>{
      setLoaded(loaded)
    }
    loaderManager.onLoad = (_,loaded,total)=>{
      setLoaded(100)
    }
		const loader = new FBXLoader(loaderManager)
		loader.setPath('/')
		loader.load('demo.fbx', (obj) => {
			obj.position.set(14, 0, 0)
			obj.scale.set(0.1, 0.1, 0.1)
			projects.push(obj)
			scene.add(obj)
		})
	})
	//制造地板
	const createFloor = useCallback(() => {
		const lambert = new THREE.MeshLambertMaterial({
			color: 'white',
			side: THREE.DoubleSide,
		})
		const plane = new THREE.PlaneBufferGeometry(120, 120, 120)
		const mesh = new THREE.Mesh(plane, lambert)
		mesh.position.set(0, 0, 0)
		mesh.rotation.x = (90 / 180) * Math.PI
		//	mesh.rotation.y = (90 / 180) * Math.PI
		//	mesh.rotation.x = (90 / 180) * Math.PI

		mesh.receiveShadow = true
		scene.add(mesh)
		floor.current = mesh
	})
	const mouseUp = useCallback(() => {
		isDown.current = false
	}, [])
	const mouseMove = useCallback((event) => {
		if (isDown.current === false) return
		//如果鼠标没有按下则不移动，必须要按住才行。
		//取原来的位置+要移动的位置
		//镜头移动算法
		angle.current += event.movementX * 0.1
		let y = camera.position.y + 0.1 * event.movementY
		const x = R.current * Math.cos((angle.current * Math.PI) / 180)
		const z = R.current * Math.sin((angle.current * Math.PI) / 180)
		if (y < 3) y = 3
		camera.position.set(x, y, z)
		camera.lookAt(0, 0, 0)
	}, [])

	//创建所有光源
	const createAllLight = useCallback(() => {
		//创建平行光，无限远，类似于太阳光束的感觉，可以投射阴影。
		const dirLight = new THREE.DirectionalLight('white', 1)
		dirLight.position.set(0, 200, 100)
		dirLight.castShadow = true
		dirLight.shadow.camera.top = -10
		dirLight.shadow.camera.bottom = 10
		dirLight.shadow.camera.right = -10
		dirLight.shadow.camera.left = 10
		dirLight.shadow.mapSize.width = 2000
		dirLight.shadow.mapSize.height = 2000
		scene.add(dirLight)
		lights.push(dirLight)
		//创建环境光
		const envLight = new THREE.AmbientLight('white', 0.3)
		scene.add(envLight)
		lights.push(envLight)
		// //创建点光源，类似灯泡。
		// const pointLight = new THREE.PointLight('white', 1, 300)
		// pointLight.castShadow = true //开启映射
		// pointLight.position.set(0, 0, 0)
		// scene.add(pointLight)
		// lights.push(pointLight)
	})
	//渲染画面
	const renderScene = useCallback(() => {
		renderer.render(scene, camera)
    //获取当前时间，刷帧。
    let time = clock.current.getDelta()
    if(mixer.current) mixer.current.update(time)
		//每次要更新页面就会调用这个，帧循环函数。
		id.current = window.requestAnimationFrame(() => renderScene())
	}, [renderer, body])
	//设置场景的大小和相机的参数
	const init = useCallback(() => {
		renderer.setSize(body.current.offsetWidth, body.current.offsetHeight)
		renderer.shadowMap.enabled = true
		renderer.setPixelRatio(Window.devicePixelRation)
		//设置相机参数
		camera.aspect = body.current.offsetWidth / body.current.offsetHeight
		camera.fov = 75
		scene.add(new THREE.AxesHelper(20))
		camera.near = 0.1
		camera.far = 1000
		camera.position.set(50, 50, 50)
		//相机的注视点，就是往哪里看,往中心原点看
		camera.lookAt(0, 0, 0)
		camera.updateProjectionMatrix()
	}, [renderer, body])
  const onWindowResize = () =>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  }
	useEffect(() => {
		//renderer.domElement就是返回的canvas
		body.current.appendChild(renderer.domElement) //将canvas添加到dom中
    window.addEventListener('resize',onWindowResize,false);
		init() //设置场景大小和相机的参数
		createAllLight() //创建平行光，只对光敏材料有用。
		createFloor()
		loadGtxFbx()
		loadYhyFbx()
		renderScene() //渲染场景
		return () => {
			//回收销毁资源
			cancelAnimationFrame(id.current)
			projects.forEach((item) => {
				scene.remove(item)
				item.geometry.dispose()
				item.material.dispose()
				item.texture.dispose()
			})
			floor.current && scene.remove(floor.current)
			lights.forEach((item) => {
				scene.remove(item)
				item.dispose()
			})
			render.dispose()
			scene.dispose()
		}
	}, [])
	return (
		<div className="box">
			{loaded < 100 && (
				<div type="dashboard" className="mask" >
         loading.....
					<Progress percent={loaded} />
				</div>
			)}
			<div
				onWheel={mouseWhell}
				className="page"
				ref={body}
				onMouseUp={mouseUp}
				onMouseMove={mouseMove}
				onMouseDown={mouseDown}
			></div>
		</div>
	)
}
export default Animation
