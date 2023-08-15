import { assign, createMachine, interpret, raise, send } from 'xstate';

describe('Xstate Machine', () => {
  test('Get the initial state instance of a machine.', () => {
    const lightMachine = createMachine({
      id: 'light',
      initial: 'green',
      context: {
        elapsed: 0,
        direction: 'east',
      },
      // State definitions
      states: {
        green: {},
        yellow: {},
        red: {},
      },
      predictableActionArguments: true,
    });
    const stateInstance = lightMachine.initialState;
    expect(stateInstance.value).toEqual('green');
  });

  describe('State Node Type', () => {
    test('atomic', () => {
      createMachine({
        id: 'dog',
        initial: 'asleep',
        states: {
          asleep: {
            type: 'atomic',
            on: { wakesUp: { target: 'awake' } },
          },
          awake: {
            type: 'atomic',
            on: { fallsAsleep: { target: 'asleep' } },
          },
        },
        predictableActionArguments: true,
      });
    });

    test('compound & final', () => {
      createMachine({
        id: 'dog',
        initial: 'waiting',
        states: {
          waiting: {
            type: 'atomic',
            on: { leaveHome: { target: 'onAWalk' } },
          },
          onAWalk: {
            type: 'compound',
            initial: 'walking',
            on: {
              arriveHome: { target: 'walkComplete' },
            },
            states: {
              walking: {
                type: 'atomic',
                on: { speedUp: { target: 'running' } },
              },
              running: {
                type: 'atomic',
                on: { slowDown: { target: 'walking' } },
              },
            },
          },
          walkComplete: {
            type: 'final',
          },
        },
        predictableActionArguments: true,
      });
    });

    test('parallel', () => {
      createMachine({
        id: 'dog',
        initial: 'waiting',
        states: {
          waiting: {
            type: 'atomic',
            on: { leaveHome: { target: 'onAWalk' } },
          },
          onAWalk: {
            type: 'parallel',
            states: {
              activity: {
                type: 'compound',
                initial: 'walking',
                states: {
                  walking: {
                    type: 'atomic',
                    on: { speedUp: { target: 'running' } },
                  },
                  running: {
                    type: 'atomic',
                    on: { slowDown: { target: 'walking' } },
                  },
                },
              },
              tail: {
                type: 'compound',
                initial: 'notWagging',
                states: {
                  notWagging: {
                    type: 'atomic',
                    on: { waggingStarts: { target: 'wagging' } },
                  },
                  wagging: {
                    type: 'atomic',
                    on: { waggingStops: { target: 'notWagging' } },
                  },
                },
              },
            },
            on: {
              arriveHome: { target: 'walkComplete' },
            },
          },
          walkComplete: {
            type: 'final',
          },
        },
        predictableActionArguments: true,
      });
    });
  });

  describe('Events', () => {
    test('sending events', () => {
      const lightMachine = createMachine({
        id: 'light',
        initial: 'green',
        context: {
          elapsed: 0,
          direction: 'east',
        },
        states: {
          green: {
            type: 'atomic',
            on: {
              TIMER: { target: 'yellow' },
            },
          },
          yellow: {
            type: 'atomic',
            on: {
              TIMER: { target: 'red' },
            },
          },
          red: {
            type: 'atomic',
            on: {
              TIMER: { target: 'green' },
            },
          },
        },
        predictableActionArguments: true,
      });
      const { initialState } = lightMachine;
      let nextState = lightMachine.transition(initialState, 'TIMER'); // string event
      expect(nextState.value).toEqual('yellow');
      nextState = lightMachine.transition(nextState, { type: 'TIMER' }); // event object
      expect(nextState.value).toEqual('red');
    });
  });

  describe('Transitions', () => {
    test('define state transitions', () => {
      createMachine({
        id: 'promise',
        initial: 'pending',
        states: {
          pending: {
            on: {
              // state transition (shorthand)
              // this is equivalent to { target: 'resolved' }
              RESOLVE: 'resolved',

              // state transition (object)
              REJECT: {
                target: 'rejected',
              },
            },
          },
          resolved: {
            type: 'final',
          },
          rejected: {
            type: 'final',
          },
        },
        predictableActionArguments: true,
      });
    });
    test('multiple targets', () => {
      createMachine({
        id: 'settings',
        type: 'parallel',
        states: {
          mode: {
            initial: 'active',
            states: {
              inactive: {},
              pending: {},
              active: {},
            },
          },
          status: {
            initial: 'enabled',
            states: {
              disabled: {},
              enabled: {},
            },
          },
        },
        on: {
          // Multiple targets
          DEACTIVATE: {
            target: ['.mode.inactive', '.status.disabled'],
          },
        },
      });
    });
    test('transition priority', () => {
      const wizardMachine = createMachine({
        id: 'wizard',
        initial: 'open',
        states: {
          open: {
            initial: 'step1',
            states: {
              step1: {
                on: {
                  NEXT: { target: 'step2' },
                },
              },
              step2: {
                on: {
                  NEXT: { target: 'step3' },
                },
              },
              step3: {
                on: {
                  NEXT: { target: 'step1' },
                },
              },
            },
            on: {
              NEXT: { target: 'goodbye' },
              CLOSE: { target: 'closed' },
            },
          },
          goodbye: {
            on: {
              CLOSE: { target: 'closed' },
            },
          },
          closed: {
            type: 'final',
          },
        },
        predictableActionArguments: true,
      });
      const { initialState } = wizardMachine;
      const nextStepState = wizardMachine.transition(initialState, {
        type: 'NEXT',
      });
      expect(nextStepState.value).toEqual({ open: 'step2' });
      const closedState = wizardMachine.transition(initialState, {
        type: 'CLOSE',
      });
      expect(closedState.value).toEqual('closed');
    });
    test('self internal transitions', () => {
      createMachine({
        id: 'word',
        initial: 'left',
        states: {
          left: {},
          right: {},
          center: {},
          justify: {},
        },
        on: {
          // internal transitions
          LEFT_CLICK: '.left',
          RIGHT_CLICK: { target: '.right' }, // same as '.right'
          CENTER_CLICK: { target: '.center', internal: true }, // same as '.center'
          JUSTIFY_CLICK: { target: '.justify', internal: true }, // same as '.justify'
        },
      });
      // Transitions that have { target: undefined } (or no target) are also internal transitions:
      createMachine({
        id: 'button',
        initial: 'inactive',
        states: {
          inactive: {
            on: { PUSH: 'active' },
          },
          active: {
            on: {
              // No target - internal transition
              PUSH: {
                actions: 'logPushed',
              },
            },
          },
        },
      });
    });
    test('self external transitions', () => {
      createMachine({
        id: 'word',
        initial: 'left',
        states: {
          left: {},
          right: {},
          center: {},
          justify: {},
        },
        on: {
          // external transitions
          LEFT_CLICK: 'word.left',
          RIGHT_CLICK: 'word.right',
          CENTER_CLICK: { target: '.center', internal: false }, // same as 'word.center'
          JUSTIFY_CLICK: { target: 'word.justify', internal: false }, // same as 'word.justify'
        },
      });
    });
    test('eventless ("always") transitions', () => {
      const gameMachine = createMachine(
        {
          id: 'game',
          initial: 'playing',
          context: {
            points: 0,
          },
          states: {
            playing: {
              // Eventless transition
              // Will transition to either 'win' or 'lose' immediately upon
              // entering 'playing' state or receiving AWARD_POINTS event
              // if the condition is met.
              always: [
                { target: 'win', cond: 'didPlayerWin' },
                { target: 'lose', cond: 'didPlayerLose' },
              ],
              on: {
                // Self-transition
                AWARD_POINTS: {
                  actions: assign({
                    points: 100,
                  }),
                },
              },
            },
            win: { type: 'final' },
            lose: { type: 'final' },
          },
          predictableActionArguments: true,
        },
        {
          guards: {
            didPlayerWin: (context) => {
              // check if player won
              return context.points > 99;
            },
            didPlayerLose: (context) => {
              // check if player lost
              return context.points < 0;
            },
          },
        },
      );

      const gameService = interpret(gameMachine).start();

      // Still in 'playing' state because no conditions of
      // transient transition were met
      // => 'playing'

      // When 'AWARD_POINTS' is sent, a self-transition to 'PLAYING' occurs.
      // The transient transition to 'win' is taken because the 'didPlayerWin'
      // condition is satisfied.
      const gameOver = gameService.send({ type: 'AWARD_POINTS' });
      expect(gameOver.value).toEqual('win');
    });
    test('wildcard descriptors', () => {
      const quietMachine = createMachine({
        id: 'quiet',
        initial: 'idle',
        states: {
          idle: {
            on: {
              WHISPER: undefined,
              // On any event besides a WHISPER, transition to the 'disturbed' state
              '*': 'disturbed',
            },
          },
          disturbed: {},
        },
        predictableActionArguments: true,
      });

      const whisper = quietMachine.transition(quietMachine.initialState, {
        type: 'WHISPER',
      });
      expect(whisper.value).toEqual('idle');
      const disturbed = quietMachine.transition(quietMachine.initialState, {
        type: 'SOME_EVENT',
      });
      expect(disturbed.value).toEqual('disturbed');
    });
  });

  describe('Final States', () => {
    test('done event', () => {
      createMachine({
        id: 'light',
        initial: 'green',
        states: {
          green: {
            on: {
              TIMER: { target: 'yellow' },
            },
          },
          yellow: {
            on: {
              TIMER: { target: 'red' },
            },
          },
          red: {
            type: 'parallel',
            states: {
              crosswalkNorth: {
                initial: 'walk',
                states: {
                  walk: {
                    on: {
                      PED_WAIT: { target: 'wait' },
                    },
                  },
                  wait: {
                    on: {
                      PED_STOP: { target: 'stop' },
                    },
                  },
                  stop: {
                    // 'stop' is a final state node for 'crosswalkNorth'
                    type: 'final',
                  },
                },
                onDone: {
                  actions: 'stopCrosswalkNorth',
                },
              },
              crosswalkEast: {
                initial: 'walk',
                states: {
                  walk: {
                    on: {
                      PED_WAIT: { target: 'wait' },
                    },
                  },
                  wait: {
                    on: {
                      PED_STOP: { target: 'stop' },
                    },
                  },
                  stop: {
                    // 'stop' is a final state node for 'crosswalkEast'
                    type: 'final',
                  },
                },
                onDone: {
                  actions: 'stopCrosswalkEast',
                },
              },
            },
            // When every child state node in a parallel state node is done, the parent parallel state node is also done.
            // When every final state node in every child compound node is reached, the done(...) event will be raised for the parallel state node.
            onDone: 'green',
          },
        },
      });
    });
  });
  describe('action', () => {
    test('send', () => {
      const lazyStubbornMachine = createMachine({
        id: 'stubborn',
        initial: 'inactive',
        states: {
          inactive: {
            on: {
              TOGGLE: {
                target: 'active',
                // send the TOGGLE event again to the service
                actions: send('TOGGLE'),
              },
            },
          },
          active: {
            on: {
              TOGGLE: { target: 'inactive' },
            },
          },
        },
        predictableActionArguments: true,
      });

      const nextState = lazyStubbornMachine.transition('inactive', {
        type: 'TOGGLE',
      });
      expect(nextState.value).toEqual('active');
      expect(nextState.actions[0].type).toEqual('xstate.send');
      expect(nextState.actions[0]['event']).toEqual({ type: 'TOGGLE' });
      // The service will proceed to send itself the { type: 'TOGGLE' } event.
    });
    test('raise', () => {
      const raiseActionDemo = createMachine({
        id: 'raise',
        initial: 'entry',
        states: {
          entry: {
            on: {
              STEP: {
                target: 'middle',
              },
              RAISE: {
                target: 'middle',
                // immediately invoke the NEXT event for 'middle'
                actions: raise('NEXT'),
              },
            },
          },
          middle: {
            on: {
              NEXT: { target: 'last' },
            },
          },
          last: {
            on: {
              RESET: { target: 'entry' },
            },
          },
        },
        predictableActionArguments: true,
      });
      const service = interpret(raiseActionDemo);
      service.start();
      const state = service.send('RAISE');
      expect(state.value).toEqual('last');
    });
  });
});
