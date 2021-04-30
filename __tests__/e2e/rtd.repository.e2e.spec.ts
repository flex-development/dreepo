/**
 * @file E2E Tests - RTDRepository
 * @module tests/e2e/RTDRepository
 */

jest.unmock('axios')
jest.unmock('lodash.merge')
jest.unmock('lodash.omit')

describe('e2e:repositories/RTDRepository', () => {
  describe('#clear', () => {
    it.todo('should clear database')
  })

  describe('#create', () => {
    it.todo('should create new entity')
  })

  describe('#delete', () => {
    it.todo('should remove one entity')

    it.todo('should remove a group of entities')
  })

  describe('#patch', () => {
    it.todo('should update an entity')
  })

  describe('#refreshCache', () => {
    it.todo('should update repository cache')
  })

  describe('#request', () => {
    it.todo('should request firebase database rest api')
  })

  describe('#save', () => {
    describe('should create', () => {
      it.todo('should create an entity')

      it.todo('should create a group of entities')
    })

    describe('should patch', () => {
      it.todo('should patch an entity')

      it.todo('should patch a group of entities')
    })
  })
})
