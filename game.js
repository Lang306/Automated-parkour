// 获取玩家元素
const player = document.getElementById("player");
let isJumping = false; // 标记玩家是否正在跳跃，防止连续跳跃
const scoreElem = document.getElementById("score");
let score = 0;
const gameDiv = document.getElementById("game");

let gameInterval = null;
let obstacleIntervals = [];
let paused = false;

// 跳跃函数
function jump() {
  if (isJumping || paused) return; // 暂停时不能跳
  isJumping = true;
  let jumpHeight = 0;
  // 上升阶段
  const upInterval = setInterval(() => {
    if (jumpHeight >= 150) { // 达到最大高度
      clearInterval(upInterval);
      // 下落阶段
      const downInterval = setInterval(() => {
        if (jumpHeight <= 0) { // 落地
          clearInterval(downInterval);
          isJumping = false; // 跳跃结束
        }
        jumpHeight -= 5;
        player.style.bottom = jumpHeight + "px"; // 更新玩家位置
      }, 20);
    } else {
      jumpHeight += 5;
      player.style.bottom = jumpHeight + "px"; // 更新玩家位置
    }
  }, 20);
}

// 监听键盘事件，按下方向上键触发跳跃，空格键暂停/继续
document.addEventListener("keydown", e => {
    if (e.code === "ArrowUp") {
        jump();
    }
    if (e.code === "Space") {
        togglePause();
        // 阻止页面滚动
        e.preventDefault();
    }
});

// 添加障碍物
function createObstacle() {
  if (paused) return;
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  obstacle.style.position = "absolute";
  obstacle.style.width = "20px";
  obstacle.style.height = "50px";
  obstacle.style.background = "#333";
  obstacle.style.bottom = "0px";
  obstacle.style.right = "-30px"; // 初始位置在屏幕右侧外

  document.getElementById("game").appendChild(obstacle);

  let right = -30;
  let scored = false;
  let autoJumped = false; // 标记是否已自动跳跃
  // 障碍物移动定时器
  const interval = setInterval(() => {
    if (paused) return;
    right += 5;
    obstacle.style.right = right + "px"; // 向左移动

    // 自动跳跃检测
    const playerRect = player.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();
    // 当障碍物左侧到达玩家右侧60px时自动跳跃
    if (
      !autoJumped &&
      obsRect.left <= playerRect.right + 60 &&
      obsRect.left > playerRect.right &&
      !isJumping
    ) {
      jump();
      autoJumped = true;
    }

    // 碰撞检测
    if (
      playerRect.left < obsRect.right &&
      playerRect.right > obsRect.left &&
      playerRect.top < obsRect.bottom &&
      playerRect.bottom > obsRect.top
    ) {
      gameOver();
    }

    // 计分：障碍物完全通过玩家且未加分时加1分
    if (!scored && (obstacle.getBoundingClientRect().right < player.getBoundingClientRect().left)) {
      score += 1;
      scoreElem.textContent = "得分：" + score;
      scored = true;
    }

    // 移除超出屏幕的障碍物
    if (right > 830) {
      clearInterval(interval);
      obstacle.remove();
    }
  }, 20);
  obstacleIntervals.push(interval);
}

// 开始游戏
function startGame() {
  score = 0;
  scoreElem.textContent = "得分：0";
  // 移除旧障碍物
  document.querySelectorAll(".obstacle").forEach(o => o.remove());
  // 清除旧定时器
  obstacleIntervals.forEach(i => clearInterval(i));
  obstacleIntervals = [];
  paused = false;
  // 生成障碍物
  gameInterval = setInterval(createObstacle, 2000);
}

// 暂停/继续游戏
function togglePause() {
  paused = !paused;
  if (!paused) {
    // 立即生成障碍物，防止暂停后间隔过长
    createObstacle();
  }
}

// 游戏结束处理
function gameOver() {
  alert("游戏结束！关闭文件重开继续");
  location.reload();
}

// 页面加载即开始游戏
startGame();