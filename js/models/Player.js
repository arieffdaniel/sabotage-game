export default class Player {
  constructor(name) {
    this.name = name;
    this.role = '';
    this.isAlive = true;
    this.isSilenced = false;
    this.isProtected = false;
    this.wasInvestigated = false;
  }
  get isSaboteur() {
    return this.role === 'Saboteur';
  }
}
