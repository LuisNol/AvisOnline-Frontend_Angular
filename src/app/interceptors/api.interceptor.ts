import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clonar la petición para agregar headers
    let apiReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // En producción, agregar headers adicionales de seguridad
    if (environment.production) {
      apiReq = apiReq.clone({
        setHeaders: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
    }

    return next.handle(apiReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('🚨 API Error intercepted:', error);
        
        // Manejo específico de errores
        let errorMessage = 'Error desconocido';
        
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
            break;
          case 400:
            errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
            break;
          case 401:
            errorMessage = 'No autorizado. Inicia sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'Acceso denegado. No tienes permisos para esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado. El endpoint no existe.';
            break;
          case 422:
            errorMessage = 'Datos de validación incorrectos.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Contacta al administrador.';
            break;
          case 502:
            errorMessage = 'Error de gateway. El servidor no está disponible.';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Intenta más tarde.';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
        }

        // En desarrollo, mostrar más detalles
        if (!environment.production) {
          console.error('🔍 Error details:', {
            url: error.url,
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
        }

        // Crear un error personalizado
        const customError = new HttpErrorResponse({
          error: error.error,
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url || undefined
        });

        // Agregar mensaje personalizado
        (customError as any).userMessage = errorMessage;

        return throwError(() => customError);
      })
    );
  }
} 