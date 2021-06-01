module.exports = function (patterns) {
  const map = {
    'Database per Service': 'dbps',
    Saga: 'saga',
    'Event Sourcing': 'esou',
    'Asynchronous Messaging': 'amsg',
    'Domain Event': 'devt',
    'Transactional Outbox': 'tbox',
    'API Composition': 'apic',
    CQRS: 'cqrs',
    'API Gateway': 'apig',
    BFF: 'bffs',
    'Adapter Microservice': 'adap'
  };

  return patterns.map((name) => map[name]);
};
