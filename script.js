

        // ROI Calculator Logic
        function calculateROI() {
            const val = parseInt(document.getElementById('roiSlider').value);
            document.getElementById('roiPalletsVal').textContent = val + " palet";

            const hoursSaved = Math.round(val * 9.6);
            const palletsSaved = Math.round(val * 7.2);
            const moneySaved = (hoursSaved * 50 + palletsSaved * 90).toLocaleString('pl-PL');

            document.getElementById('roiHoursSaved').textContent = hoursSaved + " godz.";
            document.getElementById('roiPalletsSaved').textContent = palletsSaved + " palet";
            document.getElementById('roiMoneySaved').textContent = moneySaved + " PLN";
        }

        // Tab Switching Logic inside Demo Showcase
        function switchDemoTab(tabId) {
            document.querySelectorAll('.demo-tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.demo-tab-btn').forEach(btn => {
                btn.classList.remove('bg-[var(--paper)]', 'text-[var(--ink)]', 'border', 'border-[var(--line)]', 'shadow-sm');
                btn.classList.add('text-[var(--ink-soft)]');
            });

            const target = document.getElementById(tabId);
            target.classList.remove('hidden');

            const activeBtn = document.getElementById('btn-' + tabId);
            activeBtn.classList.add('bg-[var(--paper)]', 'text-[var(--ink)]', 'border', 'border-[var(--line)]', 'shadow-sm');
            activeBtn.classList.remove('text-[var(--ink-soft)]');

            if (tabId === 'view-3d') {
                onWindowResize3D();
            } else if (tabId === 'view-2d') {
                render2DLayerDemo();
            }
        }

        // Scenario switching logic
        let currentScenario = 'standard';

        function changeDemoScenario(scen) {
            currentScenario = scen;
            document.querySelectorAll('.scenario-btn').forEach(b => {
                b.classList.remove('bg-[var(--paper)]', 'text-[var(--ink)]', 'shadow-sm');
                b.classList.add('bg-[var(--card)]', 'text-[var(--ink-soft)]');
            });

            const activeBtn = document.getElementById('btn-scen-' + scen);
            activeBtn.classList.add('bg-[var(--paper)]', 'text-[var(--ink)]', 'shadow-sm');
            activeBtn.classList.remove('bg-[var(--card)]', 'text-[var(--ink-soft)]');

            const palletsEl = document.getElementById('demoStatPallets');
            const weightEl = document.getElementById('demoStatWeight');
            const volumeEl = document.getElementById('demoStatVolume');
            const framesEl = document.getElementById('demoStatFrames');

            if (scen === 'standard') {
                palletsEl.textContent = '1 szt. (EUR-1)';
                weightEl.textContent = '258.0 kg';
                volumeEl.textContent = '88.4 %';
                framesEl.textContent = 'Brak potrzeb';
            } else if (scen === 'framed') {
                palletsEl.textContent = '2 szt. (Piętrowane)';
                weightEl.textContent = '482.5 kg';
                volumeEl.textContent = '94.1 %';
                framesEl.textContent = '1 szt. (200mm)';
            } else {
                palletsEl.textContent = '1 szt. (EUR-1 + Profile)';
                weightEl.textContent = '315.0 kg';
                volumeEl.textContent = '91.0 %';
                framesEl.textContent = 'Brak (Spięcie)';
            }

            build3DPalletScene();
            render2DLayerDemo();
        }

        // Render 2D Layer Scheme
        function render2DLayerDemo() {
            const layerVal = document.getElementById('demoLayerSlider').value;
            document.getElementById('demoLayerVal').textContent = `Warstwa ${layerVal} z 3`;
            document.getElementById('layerDetailNum').textContent = layerVal;

            const grid = document.getElementById('grid2DContainer');
            grid.innerHTML = '';

            const countEl = document.getElementById('layerDetailCount');

            if (currentScenario === 'standard') {
                countEl.textContent = '6x Karton Zbiorczy GOLFKARTON';
                for (let i = 0; i < 6; i++) {
                    const box = document.createElement('div');
                    box.className = 'w-[72px] h-[85px] bg-[#ee9b00] border border-[#b87800] text-white font-mono font-bold text-[10px] flex items-center justify-center rounded shadow-sm';
                    box.textContent = 'Karton ' + (i + 1);
                    grid.appendChild(box);
                }
            } else if (currentScenario === 'framed') {
                countEl.textContent = '4x Duże Pudło GRID 2.2';
                for (let i = 0; i < 4; i++) {
                    const box = document.createElement('div');
                    box.className = 'w-[110px] h-[65px] bg-[#ca6702] border border-[#964a00] text-white font-mono font-bold text-[10px] flex items-center justify-center rounded shadow-sm';
                    box.textContent = 'GRID 2.2';
                    grid.appendChild(box);
                }
            } else {
                countEl.textContent = '2x Profile ALU + 4x Karton Zbiorczy';
                for (let i = 0; i < 4; i++) {
                    const box = document.createElement('div');
                    box.className = 'w-[72px] h-[65px] bg-[#ee9b00] border border-[#b87800] text-white font-mono font-bold text-[9px] flex items-center justify-center rounded';
                    box.textContent = 'Karton';
                    grid.appendChild(box);
                }
                const prof = document.createElement('div');
                prof.className = 'w-full h-[35px] bg-[#005f73] border border-[#003845] text-white font-mono font-bold text-[10px] flex items-center justify-center rounded mt-1';
                prof.textContent = 'PROFIL ALU (1150 mm)';
                grid.appendChild(prof);
            }
        }

        // Copy Text Report Mock
        function copyDemoReport() {
            const txt = document.getElementById('demoReportText').innerText;
            navigator.clipboard.writeText(txt).then(() => {
                const btnTxt = document.getElementById('reportCopyTxt');
                btnTxt.textContent = 'Skopiowano! ✓';
                setTimeout(() => { btnTxt.textContent = 'Kopiuj Raport'; }, 2000);
            });
        }

        /* THREE.JS 3D ENGINE INTEGRATION */
        let scene3D, camera3D, renderer3D, palletGroup3D;
        let isMouseDown3D = false;
        let prevMousePos = { x: 0, y: 0 };

        function init3DShowcase() {
            const container = document.getElementById('canvas3DHolder');
            if (!container) return;

            scene3D = new THREE.Scene();
            scene3D.background = new THREE.Color(0x111827);

            camera3D = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera3D.position.set(2.8, 2.4, 3.4);
            camera3D.lookAt(0, 0.4, 0);

            renderer3D = new THREE.WebGLRenderer({ antialias: true });
            renderer3D.setSize(container.clientWidth, container.clientHeight);
            renderer3D.shadowMap.enabled = true;
            container.appendChild(renderer3D.domElement);

            // Ambient & Directional Lighting
            const ambient = new THREE.AmbientLight(0xffffff, 0.75);
            scene3D.add(ambient);

            const sun = new THREE.DirectionalLight(0xffffff, 0.85);
            sun.position.set(5, 10, 6);
            sun.castShadow = true;
            scene3D.add(sun);

            // Ground grid line
            const grid = new THREE.GridHelper(6, 20, 0xe8a93b, 0x374151);
            grid.position.y = -0.01;
            scene3D.add(grid);

            palletGroup3D = new THREE.Group();
            scene3D.add(palletGroup3D);

            build3DPalletScene();

            // Event Listeners for 3D Camera Orbit
            container.addEventListener('mousedown', (e) => { isMouseDown3D = true; });
            window.addEventListener('mouseup', () => { isMouseDown3D = false; });
            container.addEventListener('mousemove', (e) => {
                if (!isMouseDown3D) return;
                const deltaX = e.clientX - prevMousePos.x;
                const deltaY = e.clientY - prevMousePos.y;

                palletGroup3D.rotation.y += deltaX * 0.01;
                palletGroup3D.rotation.x += deltaY * 0.005;
                palletGroup3D.rotation.x = Math.max(-0.4, Math.min(0.9, palletGroup3D.rotation.x));

                prevMousePos = { x: e.clientX, y: e.clientY };
            });

            container.addEventListener('wheel', (e) => {
                camera3D.position.z += e.deltaY * 0.002;
                camera3D.position.z = Math.max(1.8, Math.min(6.5, camera3D.position.z));
            });

            window.addEventListener('resize', onWindowResize3D);
            animate3D();
        }

        function createPalletMesh(y) {
            const group = new THREE.Group();
            const woodMat = new THREE.MeshStandardMaterial({ color: 0xA9713F, roughness: 0.8 });

            // Bottom planks
            for (let i = -0.5; i <= 0.5; i += 0.5) {
                const plank = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.1), woodMat);
                plank.position.set(0, y + 0.01, i * 0.7);
                group.add(plank);
            }
            // Support blocks
            for (let x = -0.5; x <= 0.5; x += 0.5) {
                for (let z = -0.35; z <= 0.35; z += 0.35) {
                    const block = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.1), woodMat);
                    block.position.set(x, y + 0.06, z);
                    group.add(block);
                }
            }
            // Top planks
            for (let i = -0.55; i <= 0.55; i += 0.22) {
                const plank = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.8), woodMat);
                plank.position.set(i, y + 0.11, 0);
                group.add(plank);
            }
            return group;
        }

        function build3DPalletScene() {
            while (palletGroup3D.children.length > 0) {
                palletGroup3D.remove(palletGroup3D.children[0]);
            }

            const p1 = createPalletMesh(0);
            palletGroup3D.add(p1);

            const yellowBoxMat = new THREE.MeshStandardMaterial({ color: 0xee9b00, roughness: 0.4 });
            const bigBoxMat = new THREE.MeshStandardMaterial({ color: 0xca6702, roughness: 0.5 });
            const profileMat = new THREE.MeshStandardMaterial({ color: 0x005f73, metalness: 0.7, roughness: 0.3 });
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x2C3E48, metalness: 0.4, roughness: 0.4 });

            if (currentScenario === 'standard') {
                for (let x = -0.35; x <= 0.35; x += 0.36) {
                    for (let z = -0.25; z <= 0.25; z += 0.26) {
                        for (let layer = 0; layer < 3; layer++) {
                            const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.23), yellowBoxMat);
                            box.position.set(x, 0.12 + 0.11 + layer * 0.23, z);
                            palletGroup3D.add(box);
                        }
                    }
                }
            } else if (currentScenario === 'framed') {
                // Bottom boxes
                for (let x = -0.35; x <= 0.35; x += 0.36) {
                    for (let z = -0.25; z <= 0.25; z += 0.26) {
                        const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.23), yellowBoxMat);
                        box.position.set(x, 0.12 + 0.11, z);
                        palletGroup3D.add(box);
                    }
                }
                // Collar frame
                const frameH = 0.2;
                const frameY = 0.12 + 0.23 + frameH / 2;
                const wallW = new THREE.Mesh(new THREE.BoxGeometry(1.22, frameH, 0.02), frameMat);
                wallW.position.set(0, frameY, 0.41);
                palletGroup3D.add(wallW);

                const wallE = new THREE.Mesh(new THREE.BoxGeometry(1.22, frameH, 0.02), frameMat);
                wallE.position.set(0, frameY, -0.41);
                palletGroup3D.add(wallE);

                // Stacked top pallet
                const p2Y = frameY + frameH / 2;
                palletGroup3D.add(createPalletMesh(p2Y));

                // Big Boxes on Top
                const g1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.36), bigBoxMat);
                g1.position.set(-0.28, p2Y + 0.12 + 0.16, 0);
                palletGroup3D.add(g1);

                const g2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.36), bigBoxMat);
                g2.position.set(0.28, p2Y + 0.12 + 0.16, 0);
                palletGroup3D.add(g2);
            } else {
                // Scenario: Profiles & mixed
                for (let x = -0.35; x <= 0.35; x += 0.36) {
                    for (let z = -0.25; z <= 0.25; z += 0.26) {
                        const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.23), yellowBoxMat);
                        box.position.set(x, 0.12 + 0.11, z);
                        palletGroup3D.add(box);
                    }
                }
                const prof1 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.15), profileMat);
                prof1.position.set(0, 0.12 + 0.23 + 0.04, 0.25);
                palletGroup3D.add(prof1);

                const prof2 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.15), profileMat);
                prof2.position.set(0, 0.12 + 0.23 + 0.04, -0.25);
                palletGroup3D.add(prof2);
            }

            palletGroup3D.position.set(0, -0.3, 0);
        }

        function reset3DCamera() {
            if (palletGroup3D) palletGroup3D.rotation.set(0, 0, 0);
            if (camera3D) {
                camera3D.position.set(2.8, 2.4, 3.4);
                camera3D.lookAt(0, 0.4, 0);
            }
        }

        function onWindowResize3D() {
            const container = document.getElementById('canvas3DHolder');
            if (!container || !renderer3D || !camera3D) return;
            camera3D.aspect = container.clientWidth / container.clientHeight;
            camera3D.updateProjectionMatrix();
            renderer3D.setSize(container.clientWidth, container.clientHeight);
        }

        function animate3D() {
            requestAnimationFrame(animate3D);
            if (!isMouseDown3D && palletGroup3D) {
                palletGroup3D.rotation.y += 0.002;
            }
            if (renderer3D && scene3D && camera3D) {
                renderer3D.render(scene3D, camera3D);
            }
        }

        // Window onload initialization
        window.onload = function() {
            init3DShowcase();
            calculateROI();
        };