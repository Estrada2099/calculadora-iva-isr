import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, Percent, Settings } from 'lucide-react';

export default function CalculadoraIVA() {
  const [pestana, setPestana] = useState('calculadora');
  const [displayOperacion, setDisplayOperacion] = useState('');
  const [displayResultado, setDisplayResultado] = useState('0');
  const [subtotal, setSubtotal] = useState(0);
  const [nuevoNumero, setNuevoNumero] = useState(true);
  const [incluirISR, setIncluirISR] = useState(true);
  
  // Para desglose inverso
  const [valorNeto, setValorNeto] = useState('');
  
  // Para porcentajes
  const [montoDescuento, setMontoDescuento] = useState('');
  const [porcentajeDescuento, setPorcentajeDescuento] = useState('');
  const [montoNoval, setMontoNoval] = useState('');
  const [montoRhino, setMontoRhino] = useState('');
  
  // Configuración de porcentajes (guardados en localStorage)
  const [descuentoNoval, setDescuentoNoval] = useState(() => {
    const saved = localStorage.getItem('descuentoNoval');
    return saved ? parseFloat(saved) : 37;
  });
  const [descuentoRhino, setDescuentoRhino] = useState(() => {
    const saved = localStorage.getItem('descuentoRhino');
    return saved ? parseFloat(saved) : 48;
  });
  const [mostrarConfig, setMostrarConfig] = useState(false);

  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem('descuentoNoval', descuentoNoval.toString());
  }, [descuentoNoval]);

  useEffect(() => {
    localStorage.setItem('descuentoRhino', descuentoRhino.toString());
  }, [descuentoRhino]);

  // Formatear número con comas
  const formatearNumero = (valor) => {
    if (!valor) return '';
    const numero = valor.toString().replace(/,/g, '');
    if (isNaN(numero)) return valor;
    return parseFloat(numero).toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  // Formatear resultado (siempre con 2 decimales)
  const formatearResultado = (numero) => {
    return numero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Limpiar formato para cálculos
  const limpiarNumero = (valor) => {
    return parseFloat(valor.toString().replace(/,/g, '')) || 0;
  };

  // Manejar cambio en inputs con formato
  const manejarCambioFormateado = (valor, setter) => {
    const limpio = valor.replace(/,/g, '');
    if (limpio === '' || !isNaN(limpio)) {
      setter(limpio);
    }
  };
  const evaluarExpresion = (expr) => {
    try {
      const expresionLimpia = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');
      
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
      
      if (['+', '−', '×', '÷', '('].includes(ultimoCaracter)) {
        const expresionSinOperador = displayOperacion.slice(0, -1);
        if (expresionSinOperador) {
          const resultado = evaluarExpresion(expresionSinOperador);
          setSubtotal(resultado);
        }
      } else {
        const resultado = evaluarExpresion(displayOperacion);
        setSubtotal(resultado);
        setDisplayResultado(resultado.toString());
      }
    } else if (displayOperacion.includes('=')) {
      const valor = parseFloat(displayResultado) || 0;
      setSubtotal(valor);
    } else {
      const valor = parseFloat(displayResultado) || 0;
      setSubtotal(valor);
    }
  }, [displayOperacion]);

  // Soporte para teclado del PC
  useEffect(() => {
    if (pestana !== 'calculadora') return;

    const manejarTeclado = (e) => {
      e.preventDefault();
      
      // Números
      if (e.key >= '0' && e.key <= '9') {
        agregarCaracter(e.key);
      }
      // Operadores
      else if (e.key === '+') {
        agregarOperador('+');
      }
      else if (e.key === '-') {
        agregarOperador('−');
      }
      else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        agregarOperador('×');
      }
      else if (e.key === '/') {
        agregarOperador('÷');
      }
      // Paréntesis
      else if (e.key === '(' || e.key === ')') {
        agregarParentesis();
      }
      // Decimal
      else if (e.key === '.' || e.key === ',') {
        agregarDecimal();
      }
      // Igual
      else if (e.key === 'Enter' || e.key === '=') {
        calcularIgual();
      }
      // Borrar
      else if (e.key === 'Backspace') {
        borrar();
      }
      // Limpiar
      else if (e.key === 'Escape' || e.key === 'Delete') {
        limpiar();
      }
    };

    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [pestana, displayOperacion, displayResultado]);

  const agregarCaracter = (caracter) => {
    if (nuevoNumero && !isNaN(caracter)) {
      setDisplayOperacion(caracter);
      setDisplayResultado(caracter);
      setNuevoNumero(false);
    } else {
      const nuevaOperacion = displayOperacion + caracter;
      setDisplayOperacion(nuevaOperacion);
      
      if (!isNaN(caracter) || caracter === '.') {
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
      const ultimoCaracter = displayOperacion.slice(-1);
      if (['+', '−', '×', '÷'].includes(ultimoCaracter)) {
        setDisplayOperacion(displayOperacion.slice(0, -1) + operador);
      } else {
        setDisplayOperacion(displayOperacion + operador);
      }
    } else {
      setDisplayOperacion(displayResultado + operador);
    }
    setNuevoNumero(false);
  };

  const agregarParentesis = () => {
    const abiertos = (displayOperacion.match(/\(/g) || []).length;
    const cerrados = (displayOperacion.match(/\)/g) || []).length;
    
    if (abiertos === cerrados) {
      if (displayOperacion === '' || ['+', '−', '×', '÷', '('].includes(displayOperacion.slice(-1))) {
        setDisplayOperacion(displayOperacion + '(');
      } else {
        setDisplayOperacion(displayOperacion + '×(');
      }
    } else {
      if (!['+', '−', '×', '÷', '('].includes(displayOperacion.slice(-1))) {
        setDisplayOperacion(displayOperacion + ')');
      }
    }
    setNuevoNumero(false);
  };

  const agregarDecimal = () => {
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
  const retencionISR = incluirISR ? subtotal * 0.0125 : 0;
  const total = subtotal + iva - retencionISR;

  // Cálculo inverso
  const neto = parseFloat(valorNeto) || 0;
  const factorInverso = incluirISR ? 1.1475 : 1.16;
  const subtotalInverso = neto / factorInverso;
  const ivaInverso = subtotalInverso * 0.16;
  const isrInverso = incluirISR ? subtotalInverso * 0.0125 : 0;

  // Cálculos de descuentos
  const montoDesc = limpiarNumero(montoDescuento);
  const porcDesc = limpiarNumero(porcentajeDescuento);
  const descuentoCalc = montoDesc * (porcDesc / 100);
  const totalDescuento = montoDesc - descuentoCalc;

  const montoNov = limpiarNumero(montoNoval);
  const descuentoNov = montoNov * (descuentoNoval / 100);
  const totalNoval = montoNov - descuentoNov;

  const montoRhi = limpiarNumero(montoRhino);
  const descuentoRhi = montoRhi * (descuentoRhino / 100);
  const subtotalRhino = montoRhi - descuentoRhi;
  const ivaRhino = subtotalRhino * 0.16;
  const totalRhino = subtotalRhino + ivaRhino;

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
              className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all ${
                pestana === 'calculadora' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Calculator className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Calculadora</span>
            </button>
            <button
              onClick={() => setPestana('inverso')}
              className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all ${
                pestana === 'inverso' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Desglose</span>
            </button>
            <button
              onClick={() => setPestana('descuentos')}
              className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all ${
                pestana === 'descuentos' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Percent className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Descuentos</span>
            </button>
          </div>
        </div>

        {/* Contenido Calculadora */}
        {pestana === 'calculadora' && (
          <>
            <div className="p-6 bg-slate-800">
              <div className="bg-slate-700 rounded-2xl p-4 mb-4">
                <div className="text-right text-lg text-gray-400 mb-2 overflow-x-auto whitespace-nowrap pb-1 min-h-[28px]">
                  {displayOperacion || '\u00A0'}
                </div>
                <div className="text-right text-4xl font-bold text-white break-all">
                  {displayResultado}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${formatearResultado(subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>IVA (16%):</span>
                  <span className="font-semibold">+ ${formatearResultado(iva)}</span>
                </div>
                <div className="flex justify-between items-center text-red-400">
                  <div className="flex items-center gap-2">
                    <span>ISR (1.25%):</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirISR}
                        onChange={(e) => setIncluirISR(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${incluirISR ? 'bg-blue-600' : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${incluirISR ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`}></div>
                      </div>
                    </label>
                  </div>
                  <span className="font-semibold">- ${formatearResultado(retencionISR)}</span>
                </div>
                <div className="pt-2 border-t border-slate-600 flex justify-between text-white text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">${formatearResultado(total)}</span>
                </div>
              </div>
            </div>

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

        {/* Contenido Porcentajes */}
        {pestana === 'descuentos' && (
          <div className="p-6 bg-slate-800 space-y-4 max-h-[600px] overflow-y-auto">
            {/* Botón de Configuración */}
            <div className="flex justify-end">
              <button
                onClick={() => setMostrarConfig(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-semibold">Configurar</span>
              </button>
            </div>

            {/* 1. Cálculo de Descuento */}
            <div className="bg-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Cálculo de Descuento</h3>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    placeholder="Monto"
                    value={formatearNumero(montoDescuento)}
                    onChange={(e) => manejarCambioFormateado(e.target.value, setMontoDescuento)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="number"
                  placeholder="% Descuento"
                  min="0"
                  max="100"
                  value={porcentajeDescuento}
                  onChange={(e) => setPorcentajeDescuento(Math.max(0, e.target.value))}
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Descuento:</span>
                    <span className="text-red-400">-${formatearResultado(descuentoCalc)}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold">
                    <span>Total:</span>
                    <span className="text-green-400">${formatearResultado(totalDescuento)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Descuento Noval */}
            <div className="bg-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Descuento Noval ({descuentoNoval}%)</h3>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    placeholder="Monto"
                    value={formatearNumero(montoNoval)}
                    onChange={(e) => manejarCambioFormateado(e.target.value, setMontoNoval)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Descuento:</span>
                    <span className="text-red-400">-${formatearResultado(descuentoNov)}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold">
                    <span>Total:</span>
                    <span className="text-green-400">${formatearResultado(totalNoval)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Descuento Rhino */}
            <div className="bg-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Descuento Rhino ({descuentoRhino}%)</h3>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    placeholder="Monto"
                    value={formatearNumero(montoRhino)}
                    onChange={(e) => manejarCambioFormateado(e.target.value, setMontoRhino)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Descuento:</span>
                    <span className="text-red-400">-${formatearResultado(descuentoRhi)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Subtotal:</span>
                    <span>${formatearResultado(subtotalRhino)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>IVA (16%):</span>
                    <span className="text-green-400">+${formatearResultado(ivaRhino)}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold pt-1 border-t border-slate-600">
                    <span>Total:</span>
                    <span className="text-green-400">${formatearResultado(totalRhino)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

              <div className="bg-slate-700 rounded-2xl p-4">
                <label className="text-gray-400 text-sm block mb-2">Valor Neto Total</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={formatearNumero(valorNeto)}
                    onChange={(e) => manejarCambioFormateado(e.target.value, setValorNeto)}
                    className="w-full pl-10 pr-4 py-4 bg-slate-600 text-white text-3xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-white font-semibold mb-3">Desglose:</h3>
                
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-lg">${formatearResultado(subtotalInverso)}</span>
                </div>
                
                <div className="flex justify-between text-green-400">
                  <span>IVA (16%):</span>
                  <span className="font-semibold text-lg">+ ${formatearResultado(ivaInverso)}</span>
                </div>
                
                {incluirISR && (
                  <div className="flex justify-between text-red-400">
                    <span>Retención ISR (1.25%):</span>
                    <span className="font-semibold text-lg">- ${formatearResultado(isrInverso)}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-slate-600">
                  <div className="flex justify-between text-white">
                    <span className="font-bold text-lg">Total (Neto):</span>
                    <span className="font-bold text-2xl text-blue-400">${formatearResultado(neto)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Configuración */}
        {mostrarConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setMostrarConfig(false)}>
            <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xl font-bold">Configuración</h3>
                <button
                  onClick={() => setMostrarConfig(false)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Descuento Noval (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={descuentoNoval}
                    onChange={(e) => setDescuentoNoval(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full px-4 py-3 bg-slate-700 text-white text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Descuento Rhino (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={descuentoRhino}
                    onChange={(e) => setDescuentoRhino(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full px-4 py-3 bg-slate-700 text-white text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => setMostrarConfig(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Guardar
                </button>
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