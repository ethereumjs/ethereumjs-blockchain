import { rlp, toBuffer } from 'ethereumjs-util'
import BN = require('bn.js')
import Blockchain from '../dist'

const util = require('util')
const Block = require('ethereumjs-block')
const level = require('level-mem')

export const generateBlockchain = async (
  numberOfBlocks: number,
  genesisBlock?: any,
): Promise<any> => {
  const blockchain = new Blockchain({ validateBlocks: false, validatePow: false })
  const existingBlocks: any[] = genesisBlock ? [genesisBlock] : []
  const blocks = generateBlocks(numberOfBlocks, existingBlocks)

  const putGenesis = util.promisify(blockchain.putGenesis).bind(blockchain)
  const putBlocks = util.promisify(blockchain.putBlocks).bind(blockchain)

  try {
    await putGenesis(blocks[0])
    await putBlocks(blocks.slice(1))
  } catch (error) {
    return { error }
  }

  return {
    blockchain,
    blocks,
    error: null,
  }
}

export const generateBlocks = (numberOfBlocks: number, existingBlocks?: any[]): any[] => {
  const blocks = existingBlocks ? existingBlocks : []
  if (blocks.length === 0) {
    const genesisBlock = new Block()
    genesisBlock.setGenesisParams()
    blocks.push(genesisBlock)
  }
  for (let i = blocks.length; i < numberOfBlocks; i++) {
    const block = new Block()
    block.header.number = toBuffer(i)
    block.header.difficulty = '0xfffffff'
    block.header.parentHash = blocks[i - 1].hash()
    blocks.push(block)
  }
  return blocks
}

export const isConsecutive = (blocks: any[]) => {
  return !blocks.some((block: any, index: number) => {
    if (index === 0) {
      return false
    }
    return Buffer.compare(block.header.parentHash, blocks[index - 1].hash()) !== 0
  })
}

export const createTestDB = (cb: any) => {
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
