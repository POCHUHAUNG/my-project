@echo off
echo === 建置前端並部署 ===
cd /d "%~dp0client"
call npm run build
if errorlevel 1 (
  echo [錯誤] 前端建置失敗，請查看上方錯誤訊息
  pause
  exit /b 1
)
cd /d "%~dp0"
git add client/dist
git commit --allow-empty -m "chore: rebuild client dist"
git push
echo.
echo === 完成！Render 正在自動部署，約 1-2 分鐘後生效 ===
pause
