export abstract class BaseComponent {
  /**
   * The type of this component i.e "Position".
   *
   * Required as using the class name can lead to errors during minification.
   */
  abstract type: string;
}
