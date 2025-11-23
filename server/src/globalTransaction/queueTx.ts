let txQueue = Promise.resolve();

async function queueTx(fn: () => Promise<void>) {
  txQueue = txQueue.then(fn).catch(console.error);
  return txQueue;
}
export { queueTx };
