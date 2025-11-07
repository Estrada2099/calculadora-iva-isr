import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';

export default function CalculadoraIVA() {
  const [pestana, setPestana] = useState('calculadora');
  const [displayActual, setDisplayActual] = useState('0');
  const [displayOperacion, setDisplayOperacion] = useState('');
  const [displayResultado, setDisplayResultado] = useState('0');
  const [subtotal, setSubtotal] = useState(0);
  const [valorAnterior, setValorAnterior] = useState(0);
  const [esperandoNuevoNumero, setEsperandoNuevoNumero] = useState(false);
  
  // Para desglose inverso
  const [valorNeto, setValorNeto] = useState('');

  // Actualizar subtotal y display de resultado en tiempo real
  useEffect(() => {
    const valorActual = parseFloat(displayActual) || 0;
    const totalActual = valorAnterior + valorActual;
    setSubtotal(totalActual);
    setDisplayResultado(totalActual.toString());
  }, [displayActual, valorAnterior]);

  const agregarNumero = (num) => {
    if (esperandoNuevoNumero) {
      setDisplayActual(num);
      setDisplayOperacion(displayOperacion + num);
      setEsperandoNuevoNumero(false);
    } else {
      const nuevoValor = displayActual === '0' ? num : displayActual + num;
      setDisplayActual(nuevoValor);
      
      // Actualizar display de operación
      if (displayOperacion === '') {
        setDisplayOperacion(nuevoValor);
      } else {
        // Reemplazar el último número en la operación
        const partes = displayOperacion.split(/([+])/);
        partes[partes.length - 1] = nuevoValor;
        setDisplayOperacion(partes.join(''));
      }
    }
  };

  const agregarDecimal = () => {
    if (esperandoNuevoNumero) {
      setDisplayActual('0.');
      setDisplayOperacion(displayOperacion + '0.');
      setEsperandoNuevoNumero(false);
    } else if (!displayActual.includes('.')) {
      const nuevoValor = displayActual + '.';
      setDisplayActual(nuevoValor);
      
      // Actualizar display de operación
      const partes = displayOperacion.split(/([+])/);
      partes[partes.length - 1] = nuevoValor;
      setDisplayOperacion(partes.join(''));
    }
  };

  const limpiar = () => {
    setDisplayActual('0');
    setDisplayOperacion('');
    setDisplayResultado('0');
    setSubtotal(0);
    setValorAnterior(0);
    setEsperandoNuevoNumero(false);
  };

  const borrar = () => {
    if (displayActual.length > 1) {
      const nuevoValor = displayActual.slice(0, -1);
      setDisplayActual(nuevoValor);
      
      // Actualizar display de operación
      const partes = displayOperacion.split(/([+])/);
      partes[partes.length - 1] = nuevoValor;
      setDisplayOperacion(partes.join(''));
    } else {
      setDisplayActual('0');
      
      // Actualizar display de operación
      const partes = displayOperacion.split(/([+])/);
      partes[partes.length - 1] = '0';
      setDisplayOperacion(partes.join(''));
    }
  };

  const suma = () => {
    const valorActual = parseFloat(displayActual) || 0;
    const nuevoTotal = valorAnterior + valorActual;
    
    setDisplayOperacion(displayOperacion + '+');
    setValorAnterior(nuevoTotal);
    setDisplayActual('0');
    setEsperandoNuevoNumero(true);
  };

  const calcularIgual = () => {
    const valorActual = parseFloat(displayActual) || 0;
    let resultado;
    
    if (valorAnterior !== 0) {
      resultado = valorAnterior + valorActual;
    } else {
      resultado = valorActual;
    }
    
    if (displayOperacion !== '') {
      setDisplayOperacion(displayOperacion + '=');
    }
    
    setDisplayResultado(resultado.toString());
    setSubtotal(resultado);
    setDisplayActual(resultado.toString());
    setValorAnterior(0);
    setEsperandoNuevoNumero(true);
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
    { valor: '7', tipo: 'numero' },
    { valor: '8', tipo: 'numero' },
    { valor: '9', tipo: 'numero' },
    { valor: 'C', tipo: 'operador', accion: limpiar },
    { valor: '4', tipo: 'numero' },
    { valor: '5', tipo: 'numero' },
    { valor: '6', tipo: 'numero' },
    { valor: '⌫', tipo: 'operador', accion: borrar },
    { valor: '1', tipo: 'numero' },
    { valor: '2', tipo: 'numero' },
    { valor: '3', tipo: 'numero' },
    { valor: '+', tipo: 'operador', accion: suma },
    { valor: '0', tipo: 'numero' },
    { valor: '.', tipo: 'numero', accion: agregarDecimal },
    { valor: '=', tipo: 'igual', accion: calcularIgual, span2: true },
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

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (boton.accion) {
                        boton.accion();
                      } else if (esNumero || esDecimal) {
                        if (esDecimal) {
                          agregarDecimal();
                        } else {
                          agregarNumero(boton.valor);
                        }
                      }
                    }}
                    className={`
                      ${boton.span2 ? 'col-span-2' : ''}
                      ${esNumero ? 'bg-slate-700 hover:bg-slate-600 text-white' : ''}
                      ${esDecimal ? 'bg-slate-700 hover:bg-slate-600 text-white' : ''}
                      ${esOperador ? 'bg-slate-600 hover:bg-slate-500 text-blue-300' : ''}
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