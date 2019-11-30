import { rlp, toBuffer } from 'ethereumjs-util'
import BN = require('bn.js')

const Block = require('ethereumjs-block')
const level = require('level-mem')

export function generateBlocks(numberOfBlocks: number, genesisBlock: any) {
  const blocks = [genesisBlock]
  for (let i = 1; i < numberOfBlocks + 1; i++) {
    const block = new Block()
    block.header.number = toBuffer(i)
    block.header.difficulty = '0xfffffff'
    block.header.parentHash = blocks[i - 1].hash()
    blocks.push(block)
  }
  return blocks
}

export function isConsecutive(blocks: Array<any>) {
  return !blocks.some((block: any, index: number) => {
    if (index === 0) {
      return false
    }
    return Buffer.compare(block.header.parentHash, blocks[index - 1].hash()) !== 0
  })
}

export function createTestDB(cb: any) {
  const genesis = new Block()
  genesis.setGenesisParams()
  const db = level()
  db.batch(
    [
      {
        type: 'put',
        key: Buffer.from('6800000000000000006e', 'hex'),
        keyEncoding: 'binary',
        valueEncoding: 'binary',
        value: genesis.hash(),
      },
      {
        type: 'put',
        key: Buffer.from(
          '48d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
          'hex',
        ),
        keyEncoding: 'binary',
        valueEncoding: 'binary',
        value: Buffer.from('00', 'hex'),
      },
      {
        type: 'put',
        key: 'LastHeader',
        keyEncoding: 'binary',
        valueEncoding: 'binary',
        value: genesis.hash(),
      },
      {
        type: 'put',
        key: 'LastBlock',
        keyEncoding: 'binary',
        valueEncoding: 'binary',
        value: genesis.hash(),
      },
      {
        type: 'put',
        key: Buffer.from(
          '680000000000000000d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
          'hex',
        ),
        keyEncoding: 'binary',
        valueEncoding: 'binary',
        value: rlp.encode(genesis.header.raw),
      },
      {
        type: 'put',
        key: Buffer.from(
          '680000000000000000d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa374',
          'hex',
        ),
        keyEncoding: 'binary',
        valueEncoding: 'binary',
        value: rlp.encode(new BN(17179869184).toBuffer()),
      },
      {
        type: 'put',
        key: Buffer.from(
          '620000000000000000d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
          'hex',
        ),
        keyEncoding: 'binary',
        valueEncoding: 'binary',
        value: rlp.encode(genesis.serialize(false).slice(1)),
      },
      {
        type: 'put',
        key: 'heads',
        valueEncoding: 'json',
        value: { head0: { type: 'Buffer', data: [171, 205] } },
      },
    ],
    (err?: Error) => {
      cb(err, db, genesis)
    },
  )
}
