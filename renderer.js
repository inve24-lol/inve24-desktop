document.addEventListener('DOMContentLoaded', () => {
  const {
    invokeOpenLolClientSocket,
    invokeCloseLolClientSocket,
    invokeCloseAppServerSocket,
    onLog,
    onEnd,
  } = window.api;
  const startButton = document.getElementById('invokeOpenLolClientSocket');
  const reLoadButton = document.getElementById('invokeCloseLolClientSocket');
  const logArea = document.getElementById('onLog');

  startButton.addEventListener('click', async () => {
    logArea.value = '';

    startButton.hidden = true;
    await invokeOpenLolClientSocket();
    reLoadButton.hidden = false;
  });

  reLoadButton.addEventListener('click', async () => {
    startButton.hidden = false;
    await invokeCloseLolClientSocket();
    reLoadButton.hidden = true;

    logArea.value = '';
  });

  onLog((_, { message, isError = false }) => {
    const time = new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' });

    if (isError) logArea.value += `[${time}] [ERROR] - ${message}\n`;
    else logArea.value += `[${time}] [LOG] - ${message}\n`;

    logArea.scrollTop = logArea.scrollHeight;
  });

  onEnd(async (_, { isEnd }) => {
    if (isEnd) await invokeCloseAppServerSocket();
  });
});
