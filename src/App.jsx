import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';

export default function CalculadoraIVA() {
  const [pestana, setPestana] = useState('calculadora');
  const [displayOperacion, setDisplayOperacion] = useState('');
  const [displayResultado, setDisplayResultado] = useState('0');
  const [subtotal, setSubtotal] = useState(0);
  const [nuevoNumero, setNuevoNumero] = useState(true);
  
  // Para desglose inverso
  const [valorNeto, setValorNeto] = useState('');

  // Evaluar expresión matemática de forma segura
  const evaluarExpresion = (expr) => {
    try {
      // Reemplazar símbolos para evaluación
      const expresionLimpia = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');
      
      // Evaluar usando Function (más seguro que eval)
      const resultado = Function('"use strict"; return (' + expresionLimpia + ')')();
      
      if (isNaN(resultado) || !isFinite(resultado)) {
        return 0;
      }
      
      return resultado;
    } catch (error) {
      return 0;
    }
  };

  // Actualizar subtotal en tiempo real
  useEffect(() => {
    if (displayOperacion && !displayOperacion.includes('=')) {
      const ultimoCaracter = displayOperacion.slice(-1);
      
      // Si termina en operador, calcular lo que hay hasta ahora pero no cambiar el display
      if (['+', '−', '×', '÷', '('].includes(ultimoCaracter)) {
        const expresionSinOperador = displayOperacion.slice(0, -1);
        if (expresionSinOperador) {
          const resultado = evaluarExpresion(expresionSinOperador);
          setSubtotal(resultado);
        }
      } else {
        // Si no termina en operador, calcular y actualizar TANTO subtotal como display
        const resultado = evaluarExpresion(displayOperacion);
        setSubtotal(resultado);
        setDisplayResultado(resultado.toString());
      }
    } else if (displayOperacion.includes('=')) {
      // Si ya se calculó con =, mantener el resultado
      const valor = parseFloat(displayResultado) || 0;
      setSubtotal(valor);
    } else {
      const valor = parseFloat(displayResultado) || 0;
      setSubtotal(valor);
    }
  }, [displayOperacion]);

  const agregarCaracter = (caracter) => {
    if (nuevoNumero && !isNaN(caracter)) {
      setDisplayOperacion(caracter);
      setDisplayResultado(caracter);
      setNuevoNumero(false);
    } else {
      const nuevaOperacion = displayOperacion + caracter;
      setDisplayOperacion(nuevaOperacion);
      
      // Si es un número o punto, mostrar el número actual que se está escribiendo
      if (!isNaN(caracter) || caracter === '.') {
        // Encontrar el último operador
        let ultimaPosicion = -1;
        ['+', '−', '×', '÷', '('].forEach(op => {
          const pos = nuevaOperacion.lastIndexOf(op);
          if (pos > ultimaPosicion) ultimaPosicion = pos;
        });
        
        if (ultimaPosicion >= 0) {
          const numeroActual = nuevaOperacion.substring(ultimaPosicion + 1);
          setDisplayResultado(numeroActual);
        } else {
          setDisplayResultado(nuevaOperacion);
        }
      }
      setNuevoNumero(false);
    }
  };

  const agregarOperador = (operador) => {
    if (displayOperacion === '' && displayResultado !== '0') {
      setDisplayOperacion(displayResultado + operador);
    } else if (displayOperacion !== '') {
      // Si el último caracter es un operador, reemplazarlo
      const ultimoCaracter = displayOperacion.slice(-1);
      if (['+', '−', '×', '÷'].includes(ultimoCaracter)) {
        setDisplayOperacion(displayOperacion.slice(0, -1) + operador);
      } else {
        setDisplayOperacion(displayOperacion + operador);
      }
    } else {
      setDisplayOperacion(displayResultado + operador);
    }
    // NO cambiar el display de resultado aquí
    setNuevoNumero(false);
  };

  const agregarParentesis = () => {
    const abiertos = (displayOperacion.match(/\(/g) || []).length;
    const cerrados = (displayOperacion.match(/\)/g) || []).length;
    
    if (abiertos === cerrados) {
      // Agregar paréntesis de apertura
      if (displayOperacion === '' || ['+', '−', '×', '÷', '('].includes(displayOperacion.slice(-1))) {
        setDisplayOperacion(displayOperacion + '(');
      } else {
        setDisplayOperacion(displayOperacion + '×(');
      }
    } else {
      // Agregar paréntesis de cierre
      if (!['+', '−', '×', '÷', '('].includes(displayOperacion.slice(-1))) {
        setDisplayOperacion(displayOperacion + ')');
      }
    }
    setNuevoNumero(false);
  };

  const agregarDecimal = () => {
    // Verificar si ya hay un punto en el número actual
    const ultimoOperador = displayOperacion.match(/[+\−×÷(](?!.*[+\−×÷(])/);
    const numeroActual = ultimoOperador 
      ? displayOperacion.split(ultimoOperador[0]).pop() 
      : displayOperacion;
    
    if (!numeroActual.includes('.')) {
      if (displayOperacion === '' || ['+', '−', '×', '÷', '('].includes(displayOperacion.slice(-1))) {
        setDisplayOperacion(displayOperacion + '0.');
        setDisplayResultado('0.');
      } else {
        setDisplayOperacion(displayOperacion + '.');
      }
      setNuevoNumero(false);
    }
  };

  const limpiar = () => {
    setDisplayOperacion('');
    setDisplayResultado('0');
    setSubtotal(0);
    setNuevoNumero(true);
  };

  const borrar = () => {
    if (displayOperacion.length > 0) {
      const nuevaOperacion = displayOperacion.slice(0, -1);
      setDisplayOperacion(nuevaOperacion);
      
      if (nuevaOperacion === '') {
        setDisplayResultado('0');
        setSubtotal(0);
      }
    }
  };

  const calcularIgual = () => {
    if (displayOperacion !== '' && !displayOperacion.includes('=')) {
      const resultado = evaluarExpresion(displayOperacion);
      setDisplayOperacion(displayOperacion + '=');
      setDisplayResultado(resultado.toString());
      setSubtotal(resultado);
      setNuevoNumero(true);
    }
  };

  const iva = subtotal * 0.16;
  const retencionISR = subtotal * 0.0125;
  const total = subtotal + iva - retencionISR;

  // Cálculo inverso desde valor neto
  const neto = parseFloat(valorNeto) || 0;
  const subtotalInverso = neto / 1.1475;
  const ivaInverso = subtotalInverso * 0.16;
  const isrInverso = subtotalInverso * 0.0125;

  const botones = [
    { valor: '()', tipo: 'operador', accion: agregarParentesis },
    { valor: 'C', tipo: 'limpiar', accion: limpiar },
    { valor: '⌫', tipo: 'operador', accion: borrar },
    { valor: '÷', tipo: 'operador', accion: () => agregarOperador('÷') },
    
    { valor: '7', tipo: 'numero' },
    { valor: '8', tipo: 'numero' },
    { valor: '9', tipo: 'numero' },
    { valor: '×', tipo: 'operador', accion: () => agregarOperador('×') },
    
    { valor: '4', tipo: 'numero' },
    { valor: '5', tipo: 'numero' },
    { valor: '6', tipo: 'numero' },
    { valor: '−', tipo: 'operador', accion: () => agregarOperador('−') },
    
    { valor: '1', tipo: 'numero' },
    { valor: '2', tipo: 'numero' },
    { valor: '3', tipo: 'numero' },
    { valor: '+', tipo: 'operador', accion: () => agregarOperador('+') },
    
    { valor: '0', tipo: 'numero', span2: true },
    { valor: '.', tipo: 'numero', accion: agregarDecimal },
    { valor: '=', tipo: 'igual', accion: calcularIgual },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header con pestañas */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex">
            <button
              onClick={() => setPestana('calculadora')}
              className={`flex-1 p-4 flex items-center justify-center gap-2 transition-all ${
                pestana === 'calculadora' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Calculator className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Calculadora</span>
            </button>
            <button
              onClick={() => setPestana('inverso')}
              className={`flex-1 p-4 flex items-center justify-center gap-2 transition-all ${
                pestana === 'inverso' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <TrendingDown className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Desglose</span>
            </button>
          </div>
        </div>

        {/* Contenido Calculadora */}
        {pestana === 'calculadora' && (
          <>
            {/* Display con dos niveles */}
            <div className="p-6 bg-slate-800">
              <div className="bg-slate-700 rounded-2xl p-4 mb-4">
                {/* Display de operación (arriba) */}
                <div className="text-right text-lg text-gray-400 mb-2 overflow-x-auto whitespace-nowrap pb-1 min-h-[28px]">
                  {displayOperacion || '\u00A0'}
                </div>
                {/* Display de resultado (abajo - grande) */}
                <div className="text-right text-4xl font-bold text-white break-all">
                  {displayResultado}
                </div>
              </div>

              {/* Resultados en tiempo real */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>IVA (16%):</span>
                  <span className="font-semibold">+ ${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>ISR (1.25%):</span>
                  <span className="font-semibold">- ${retencionISR.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-600 flex justify-between text-white text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Teclado */}
            <div className="p-4 grid grid-cols-4 gap-2">
              {botones.map((boton, index) => {
                const esNumero = boton.tipo === 'numero' && boton.valor !== '.';
                const esDecimal = boton.valor === '.';
                const esOperador = boton.tipo === 'operador';
                const esIgual = boton.tipo === 'igual';
                const esLimpiar = boton.tipo === 'limpiar';

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (boton.accion) {
                        boton.accion();
                      } else if (esNumero) {
                        agregarCaracter(boton.valor);
                      }
                    }}
                    className={`
                      ${boton.span2 ? 'col-span-2' : ''}
                      ${esNumero ? 'bg-slate-700 hover:bg-slate-600 text-white' : ''}
                      ${esDecimal ? 'bg-slate-700 hover:bg-slate-600 text-white' : ''}
                      ${esOperador ? 'bg-slate-600 hover:bg-slate-500 text-orange-300' : ''}
                      ${esLimpiar ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                      ${esIgual ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' : ''}
                      py-5 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg
                    `}
                  >
                    {boton.valor}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Contenido Desglose Inverso */}
        {pestana === 'inverso' && (
          <div className="p-6 bg-slate-800 min-h-[500px]">
            <div className="space-y-6">
              <div>
                <h2 className="text-white text-xl font-bold mb-2">Desglose desde Valor Neto</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Ingresa el monto total (neto) y obtén el desglose
                </p>
              </div>

              {/* Input Valor Neto */}
              <div className="bg-slate-700 rounded-2xl p-4">
                <label className="text-gray-400 text-sm block mb-2">Valor Neto Total</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={valorNeto}
                    onChange={(e) => setValorNeto(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-slate-600 text-white text-3xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Resultados Inversos */}
              <div className="bg-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-white font-semibold mb-3">Desglose:</h3>
                
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-lg">${subtotalInverso.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-green-400">
                  <span>IVA (16%):</span>
                  <span className="font-semibold text-lg">+ ${ivaInverso.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-red-400">
                  <span>Retención ISR (1.25%):</span>
                  <span className="font-semibold text-lg">- ${isrInverso.toFixed(2)}</span>
                </div>
                
                <div className="pt-3 border-t border-slate-600">
                  <div className="flex justify-between text-white">
                    <span className="font-bold text-lg">Total (Neto):</span>
                    <span className="font-bold text-2xl text-blue-400">${neto.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Créditos */}
        <div className="bg-slate-800 border-t border-slate-700 py-3 px-6">
          <p className="text-center text-gray-400 text-sm">
            Creada con <span className="text-red-500">❤</span> por <span className="text-blue-400 font-semibold">Estradadev</span> programmer of <span className="text-indigo-400 font-semibold">Astil Group</span>
          </p>
        </div>
      </div>
    </div>
  );
}